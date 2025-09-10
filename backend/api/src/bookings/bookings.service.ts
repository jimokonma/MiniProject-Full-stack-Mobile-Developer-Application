import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class BookingsService implements OnModuleInit {
  private idempotencyCleanupTimer?: NodeJS.Timeout;

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
    private readonly notifications: NotificationsService,
  ) {}

  onModuleInit() {
    // Clean up old idempotency keys every hour (24h TTL)
    this.idempotencyCleanupTimer = setInterval(async () => {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      await this.prisma.idempotencyKey.deleteMany({
        where: { createdAt: { lt: cutoff } },
      });
    }, 60 * 60 * 1000);
  }

  onModuleDestroy() {
    if (this.idempotencyCleanupTimer) {
      clearInterval(this.idempotencyCleanupTimer);
      this.idempotencyCleanupTimer = undefined;
    }
  }

  async create(userId: string, dto: any, idempotencyKey?: string) {
    if (!idempotencyKey) {
      throw new BadRequestException({ code: 'IDEMPOTENCY_KEY_REQUIRED', message: 'Idempotency-Key header is required' });
    }

    const existing = await this.prisma.idempotencyKey.findUnique({
      where: { key_userId: { key: idempotencyKey, userId } },
    }).catch(() => null);

    if (existing) {
      return existing.responseBody as any;
    }

    const booking = await this.prisma.booking.create({
      data: {
        userId,
        type: dto.serviceType,
        vehicleMake: dto.vehicleMake,
        vehicleModel: dto.vehicleModel,
        vehiclePlate: dto.vehiclePlate,
        location: dto.location,
        scheduledFor: new Date(dto.scheduledFor),
      },
    });

    // Emit realtime events
    this.realtime.emitBookingStatusUpdated(booking.id, { id: booking.id, status: booking.status });
    await this.notifications.notifyUser(userId, 'Booking created', booking.id);

    await this.prisma.idempotencyKey.create({
      data: {
        key: idempotencyKey,
        userId,
        method: 'POST',
        path: '/bookings',
        responseBody: booking as any,
      },
    });

    return booking;
  }

  async listByUser(userId: string) {
    return this.prisma.booking.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async listAll() {
    return this.prisma.booking.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async detail(id: string) {
    return this.prisma.booking.findUniqueOrThrow({ where: { id } });
  }

  async historyMerged(userId: string) {
    const nestHistory = await this.prisma.booking.findMany({ where: { userId } });
    const nestNormalized = nestHistory.map((b) => ({
      id: b.id,
      userId: b.userId,
      type: b.type,
      status: b.status,
      vehicleMake: b.vehicleMake,
      vehicleModel: b.vehicleModel,
      vehiclePlate: b.vehiclePlate,
      location: b.location,
      scheduledFor: b.scheduledFor,
      createdAt: b.createdAt,
      source: 'nest' as const,
    }));

    let laravelNormalized: any[] = [];
    const baseUrl = process.env.LARAVEL_BASE_URL || 'http://localhost:8001';

    try {
      const resp = await fetch(`${baseUrl}/api/legacy/bookings/history`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (resp.ok) {
        const laravelData = await resp.json();
        // Expecting array of objects with snake_case keys from Laravel
        laravelNormalized = (Array.isArray(laravelData) ? laravelData : []).
          filter((b: any) => String(b.user_id) === String(userId)).
          map((b: any) => ({
            id: String(b.id),
            userId: String(b.user_id),
            type: String(b.type),
            status: String(b.status),
            vehicleMake: String(b.vehicle_make),
            vehicleModel: String(b.vehicle_model),
            vehiclePlate: String(b.vehicle_plate),
            location: String(b.location),
            scheduledFor: b.scheduled_for ? new Date(b.scheduled_for) : undefined,
            createdAt: b.created_at ? new Date(b.created_at) : new Date(0),
            source: 'laravel' as const,
          }));
      }
    } catch {
      // If legacy API is unreachable, proceed with only Nest data
      laravelNormalized = [];
    }

    const merged = [...nestNormalized, ...laravelNormalized];
    return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateStatus(id: string, status: string) {
    if (!['accepted','on_the_way','washing','complete','cancel'].includes(status)) {
      throw new BadRequestException({ code: 'INVALID_STATUS', message: 'Invalid booking status' });
    }
    const updated = await this.prisma.booking.update({ where: { id }, data: { status: status as any } });
    this.realtime.emitBookingStatusUpdated(id, { id, status: updated.status });
    await this.notifications.notifyUser(updated.userId, `Booking status updated to ${updated.status}`, id);
    return updated;
  }
}


