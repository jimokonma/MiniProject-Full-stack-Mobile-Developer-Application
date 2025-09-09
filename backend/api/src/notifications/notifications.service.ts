import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async notifyUser(userId: string, message: string, bookingId?: string) {
    const note = await this.prisma.notification.create({
      data: { userId, message, type: 'info', bookingId },
    });
    this.realtime.emitNotification(userId, { id: note.id, message, bookingId });
    return note;
  }
}


