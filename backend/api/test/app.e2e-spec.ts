import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('happy path: login -> create booking -> fetch', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'Jim.okonma@gmail.com', password: 'P@$$w0rd' })
      .expect(201);

    const token = login.body.accessToken;
    const idKey = 'test-key-1';
    const create = await request(app.getHttpServer())
      .post('/bookings')
      .set('Authorization', `Bearer ${token}`)
      .set('Idempotency-Key', idKey)
      .send({
        serviceType: 'dropoff',
        vehicleMake: 'Tesla',
        vehicleModel: '3',
        vehiclePlate: 'ABC123',
        location: 'HQ',
        scheduledFor: new Date().toISOString(),
      })
      .expect(201);

    const id = create.body.id;
    await request(app.getHttpServer())
      .get(`/bookings/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
