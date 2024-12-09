import {
  Controller,
  Get,
  HttpStatus,
  INestApplication,
  Module,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { Response } from 'express';
import * as request from 'supertest';
import { v7 } from 'uuid';
import { ProfileInterceptor } from './profile.interceptor';
import { Profile } from '../@types/user.interface';
import { ProfileDecorator } from '../decorator/profile.decorator';
import { JwtService } from '../jwt/jwt.service';

@UseInterceptors(ProfileInterceptor)
@Controller('profile-interceptor')
export class ProfileInterceptorController {
  constructor() {}

  @Get('test')
  async test(@ProfileDecorator() profile: Profile, @Res() res: Response) {
    if (profile) {
      return res.status(HttpStatus.OK).json({ foo: 'bar', ...profile });
    }
    return res.status(HttpStatus.OK).json({ foo: 'bar' });
  }
}

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [ProfileInterceptorController],
  providers: [JwtService],
})
class TestProfileInterceptorModule {}

describe('ProfileInterceptor', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestProfileInterceptorModule],
      providers: [JwtService],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    jwtService = moduleRef.get<JwtService>(JwtService);
  });

  it('has profile', async () => {
    const userId = v7();
    const { accessToken } = jwtService.encodeJwt(userId);
    await request(app.getHttpServer())
      .get('/profile-interceptor/test')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK)
      .then((response) => {
        expect(response.body).toEqual({ foo: 'bar', userId });
      });
  });

  it('has profile: invalid token', async () => {
    const userId = v7();
    const { refreshToken } = jwtService.encodeJwt(userId);
    await request(app.getHttpServer())
      .get('/profile-interceptor/test')
      .set('Authorization', `Bearer ${refreshToken}`)
      .expect(HttpStatus.OK)
      .then((response) => {
        expect(response.body).toEqual({ foo: 'bar' });
      });
  });

  it('no profile', async () => {
    await request(app.getHttpServer())
      .get('/profile-interceptor/test')
      .expect(HttpStatus.OK)
      .then((response) => {
        expect(response.body).toEqual({ foo: 'bar' });
      });
  });
});
