"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const realtime_gateway_1 = require("../realtime/realtime.gateway");
const notifications_service_1 = require("../notifications/notifications.service");
let BookingsService = class BookingsService {
    prisma;
    realtime;
    notifications;
    constructor(prisma, realtime, notifications) {
        this.prisma = prisma;
        this.realtime = realtime;
        this.notifications = notifications;
    }
    onModuleInit() {
        setInterval(async () => {
            const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
            await this.prisma.idempotencyKey.deleteMany({
                where: { createdAt: { lt: cutoff } },
            });
        }, 60 * 60 * 1000);
    }
    async create(userId, dto, idempotencyKey) {
        if (!idempotencyKey) {
            throw new common_1.BadRequestException({ code: 'IDEMPOTENCY_KEY_REQUIRED', message: 'Idempotency-Key header is required' });
        }
        const existing = await this.prisma.idempotencyKey.findUnique({
            where: { key_userId: { key: idempotencyKey, userId } },
        }).catch(() => null);
        if (existing) {
            return existing.responseBody;
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
        this.realtime.emitBookingStatusUpdated(booking.id, { id: booking.id, status: booking.status });
        await this.notifications.notifyUser(userId, 'Booking created', booking.id);
        await this.prisma.idempotencyKey.create({
            data: {
                key: idempotencyKey,
                userId,
                method: 'POST',
                path: '/bookings',
                responseBody: booking,
            },
        });
        return booking;
    }
    async listByUser(userId) {
        return this.prisma.booking.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    }
    async listAll() {
        return this.prisma.booking.findMany({ orderBy: { createdAt: 'desc' } });
    }
    async detail(id) {
        return this.prisma.booking.findUniqueOrThrow({ where: { id } });
    }
    async historyMerged(userId) {
        const nestHistory = await this.prisma.booking.findMany({ where: { userId } });
        const laravelSimulated = nestHistory.map((b) => ({ ...b, source: 'laravel' }));
        const merged = [...nestHistory.map((b) => ({ ...b, source: 'nest' })), ...laravelSimulated];
        return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    async updateStatus(id, status) {
        if (!['accepted', 'on_the_way', 'washing', 'complete', 'cancel'].includes(status)) {
            throw new common_1.BadRequestException({ code: 'INVALID_STATUS', message: 'Invalid booking status' });
        }
        const updated = await this.prisma.booking.update({ where: { id }, data: { status: status } });
        this.realtime.emitBookingStatusUpdated(id, { id, status: updated.status });
        await this.notifications.notifyUser(updated.userId, `Booking status updated to ${updated.status}`, id);
        return updated;
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        realtime_gateway_1.RealtimeGateway,
        notifications_service_1.NotificationsService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map