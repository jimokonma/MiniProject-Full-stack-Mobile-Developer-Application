import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { NotificationsService } from '../notifications/notifications.service';
export declare class BookingsService implements OnModuleInit {
    private readonly prisma;
    private readonly realtime;
    private readonly notifications;
    constructor(prisma: PrismaService, realtime: RealtimeGateway, notifications: NotificationsService);
    onModuleInit(): void;
    create(userId: string, dto: any, idempotencyKey?: string): Promise<any>;
    listByUser(userId: string): Promise<{
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.BookingType;
        userId: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        vehicleMake: string;
        vehicleModel: string;
        vehiclePlate: string;
        location: string;
        scheduledFor: Date;
        updatedAt: Date;
    }[]>;
    listAll(): Promise<{
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.BookingType;
        userId: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        vehicleMake: string;
        vehicleModel: string;
        vehiclePlate: string;
        location: string;
        scheduledFor: Date;
        updatedAt: Date;
    }[]>;
    detail(id: string): Promise<{
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.BookingType;
        userId: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        vehicleMake: string;
        vehicleModel: string;
        vehiclePlate: string;
        location: string;
        scheduledFor: Date;
        updatedAt: Date;
    }>;
    historyMerged(userId: string): Promise<any[]>;
    updateStatus(id: string, status: string): Promise<{
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.BookingType;
        userId: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        vehicleMake: string;
        vehicleModel: string;
        vehiclePlate: string;
        location: string;
        scheduledFor: Date;
        updatedAt: Date;
    }>;
}
