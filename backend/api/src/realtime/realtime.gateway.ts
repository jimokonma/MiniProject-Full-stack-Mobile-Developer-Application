import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({ cors: { origin: process.env.CORS_ORIGIN?.split(',') ?? '*' } })
export class RealtimeGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly prisma: PrismaService) {}

  async handleConnection(client: Socket) {
    try {
      const token = (client.handshake.auth?.token || client.handshake.headers.authorization?.replace('Bearer ', '')) as string;
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as any;
      const userId = payload.sub as string;
      client.join(`user:${userId}`);

      const bookings = await this.prisma.booking.findMany({ where: { userId }, select: { id: true } });
      bookings.forEach((b) => client.join(`booking:${b.id}`));
    } catch (e) {
      client.disconnect(true);
    }
  }

  emitBookingStatusUpdated(bookingId: string, payload: any) {
    this.server.to(`booking:${bookingId}`).emit('bookingStatusUpdated', payload);
  }

  emitNotification(userId: string, payload: any) {
    this.server.to(`user:${userId}`).emit('notification', payload);
  }
}


