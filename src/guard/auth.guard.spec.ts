import {
  Controller,
  Get,
  HttpStatus,
  INestApplication,
  Module,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { Response } from 'express';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { JwtService } from '../jwt/jwt.service';
import { v7 } from 'uuid';

@Controller('auth-guard')
@UseGuards(AuthGuard)
export class AuthGuardController {
  constructor() {}

  @Get('test')
  async test(@Res() res: Response) {
    return res.status(HttpStatus.OK).json({ foo: 'bar' });
  }
}

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AuthGuardController],
  providers: [JwtService],
})
class TestAuthGuardModule {}

describe('AuthGuard', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestAuthGuardModule],
      providers: [JwtService],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    jwtService = moduleRef.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('auth guard passed', async () => {
    const { accessToken } = jwtService.encodeJwt(v7());
    await request(app.getHttpServer())
      .get('/auth-guard/test')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK)
      .then((response) => {
        expect(response.body).toEqual({ foo: 'bar' });
      });
  });

  it('auth guard failure', async () => {
    await request(app.getHttpServer())
      .get('/auth-guard/test')
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('auth guard failure: refresh token is not allowed', async () => {
    const { refreshToken } = jwtService.encodeJwt(v7());
    await request(app.getHttpServer())
      .get('/auth-guard/test')
      .set('Authorization', `Bearer ${refreshToken}`)
      .expect(HttpStatus.UNAUTHORIZED);
  });
});
