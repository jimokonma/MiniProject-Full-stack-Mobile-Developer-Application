import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
export declare class NotificationsService {
    private readonly prisma;
    private readonly realtime;
    constructor(prisma: PrismaService, realtime: RealtimeGateway);
    notifyUser(userId: string, message: string, bookingId?: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        message: string;
        userId: string;
        bookingId: string | null;
    }>;
}
