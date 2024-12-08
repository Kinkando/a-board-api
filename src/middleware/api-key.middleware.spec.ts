import {
  Controller,
  Get,
  HttpStatus,
  INestApplication,
  MiddlewareConsumer,
  Module,
  Res,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { Response } from 'express';
import * as request from 'supertest';
import { ApiKeyMiddleware } from './api-key.middleware';

@Controller('api-key')
export class ApiKeyController {
  constructor() {}

  @Get('test')
  async test(@Res() res: Response) {
    return res.status(HttpStatus.OK).json({ foo: 'bar' });
  }
}

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [ApiKeyController],
  providers: [ApiKeyMiddleware],
})
class TestApiKeyModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiKeyMiddleware).forRoutes('*');
  }
}

describe('ApiKeyMiddleware', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestApiKeyModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('api key is valid', async () => {
    await request(app.getHttpServer())
      .get('/api-key/test')
      .set('X-Api-Key', process.env.API_KEY)
      .expect(HttpStatus.OK)
      .then((response) => {
        expect(response.body).toEqual({ foo: 'bar' });
      });
  });

  it('api key is missing', async () => {
    await request(app.getHttpServer())
      .get('/api-key/test')
      .expect(HttpStatus.UNAUTHORIZED)
      .then((response) => {
        expect(response.body).toEqual({ error: 'api key is invalid' });
      });
  });

  it('api key is invalid', async () => {
    await request(app.getHttpServer())
      .get('/api-key/test')
      .set('X-Api-Key', 'RANDOM')
      .expect(HttpStatus.UNAUTHORIZED)
      .then((response) => {
        expect(response.body).toEqual({ error: 'api key is invalid' });
      });
  });
});
