import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll((done) => {
    app.close();
    done();
  });

  it('login success', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .set('X-Api-Key', process.env.API_KEY)
      .send({ username: 'test' })
      .expect(HttpStatus.OK);
  });

  it('login failed: invalid api key', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .set('X-Api-Key', 'invalid')
      .send({ username: 'test' })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('login failed: missing api key', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'test' })
      .expect(HttpStatus.UNAUTHORIZED);
  });
});
