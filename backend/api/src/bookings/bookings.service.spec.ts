import { Test } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { NotificationsService } from '../notifications/notifications.service';

describe('BookingsService', () => {
  let service: BookingsService;
  const prisma = {
    idempotencyKey: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    booking: {
      create: jest.fn(),
    },
  } as any as PrismaService;

  const realtime = { emitBookingStatusUpdated: jest.fn() } as any as RealtimeGateway;
  const notifications = { notifyUser: jest.fn() } as any as NotificationsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: PrismaService, useValue: prisma },
        { provide: RealtimeGateway, useValue: realtime },
        { provide: NotificationsService, useValue: notifications },
      ],
    }).compile();

    service = module.get(BookingsService);
  });

  it('returns cached response when idempotency key exists', async () => {
    (prisma.idempotencyKey.findUnique as any).mockResolvedValue({ responseBody: { foo: 'bar' } });
    const res = await service.create('u1', { serviceType: 'dropoff' }, 'key1');
    expect(res).toEqual({ foo: 'bar' });
  });

  it('creates booking and stores idempotent record when no cache', async () => {
    (prisma.idempotencyKey.findUnique as any).mockResolvedValue(null);
    (prisma.booking.create as any).mockResolvedValue({ id: 'b1', status: 'accepted' });
    await service.create('u1', { serviceType: 'dropoff', vehicleMake: 'A', vehicleModel: 'B', vehiclePlate: 'C', location: 'L', scheduledFor: new Date().toISOString() }, 'key2');
    expect(prisma.idempotencyKey.create).toBeCalled();
    expect(realtime.emitBookingStatusUpdated).toBeCalledWith('b1', { id: 'b1', status: 'accepted' });
  });
});


