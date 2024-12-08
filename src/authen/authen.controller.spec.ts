import { INestApplication, InternalServerErrorException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthenController } from './authen.controller';
import { AuthenService } from './authen.service';
import { JwtService } from '../jwt/jwt.service';

describe('AuthenController', () => {
  let app: INestApplication;
  let authenService: jest.Mocked<AuthenService>;
  let controller: AuthenController;

  beforeEach(async () => {
    authenService = {
      login: jest.fn(),
      refreshToken: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      controllers: [AuthenController],
      providers: [
        JwtService,
        {
          provide: AuthenService,
          useValue: authenService,
        },
      ],
    }).compile();

    controller = module.get<AuthenController>(AuthenController);
    app = module.createNestApplication();
    await app.init();
  });

  it('login success', async () => {
    const jwt = {
      accessToken: 'access-jwt',
      refreshToken: 'refresh-jwt',
    };
    authenService.login.mockResolvedValue(jwt);
    const response = await controller.login({ username: 'test' });
    expect(response).toEqual(jwt);
  });

  it('login failed', async () => {
    authenService.login.mockRejectedValue(new InternalServerErrorException());
    expect(
      async () => await controller.login({ username: 'test' }),
    ).rejects.toThrow();
  });

  it('refresh token success', async () => {
    const jwt = {
      accessToken: 'access-jwt',
      refreshToken: 'refresh-jwt',
    };
    authenService.refreshToken.mockResolvedValue(jwt);
    const response = await controller.refreshToken({
      refreshToken: 'refresh-jwt',
    });
    expect(response).toEqual(jwt);
  });

  it('refresh token failed', async () => {
    authenService.refreshToken.mockRejectedValue(
      new InternalServerErrorException(),
    );
    expect(
      async () =>
        await controller.refreshToken({
          refreshToken: 'refresh-jwt',
        }),
    ).rejects.toThrow();
  });
});
