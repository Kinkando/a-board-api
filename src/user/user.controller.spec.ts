import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigModule } from '@nestjs/config';
import {
  GatewayTimeoutException,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '../jwt/jwt.service';
import { v7 } from 'uuid';

describe('UserController', () => {
  let app: INestApplication;
  let userService: jest.Mocked<UserService>;
  let controller: UserController;

  beforeEach(async () => {
    userService = {
      getUser: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      controllers: [UserController],
      providers: [
        JwtService,
        {
          provide: UserService,
          useValue: userService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('get user success', async () => {
    const user = {
      id: v7(),
      profileImageUrl: null,
      username: 'tester',
    };
    userService.getUser.mockResolvedValue(user);
    const response = await controller.getUser({ userId: user.id });
    expect(response).toEqual(user);
  });

  it('get user failure not found', async () => {
    userService.getUser.mockRejectedValue(new NotFoundException());
    expect(
      async () => await controller.getUser({ userId: 'not-found' }),
    ).rejects.toThrow();
  });

  it('get user failure gateway timeout', async () => {
    userService.getUser.mockRejectedValue(new GatewayTimeoutException());
    expect(
      async () => await controller.getUser({ userId: 'invalid' }),
    ).rejects.toThrow();
  });
});
