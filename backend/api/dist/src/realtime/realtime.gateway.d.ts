import { OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
export declare class RealtimeGateway implements OnGatewayConnection {
    private readonly prisma;
    server: Server;
    constructor(prisma: PrismaService);
    handleConnection(client: Socket): Promise<void>;
    emitBookingStatusUpdated(bookingId: string, payload: any): void;
    emitNotification(userId: string, payload: any): void;
}
