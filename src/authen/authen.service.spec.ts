import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Kysely } from 'kysely';
import { v7 } from 'uuid';
import { AuthenService } from './authen.service';
import { JwtService } from '../jwt/jwt.service';
import { databaseProvider } from '../module/database.module';

describe('AuthenService', () => {
  let service: AuthenService;
  let jwtService: JwtService;
  let dbMock: jest.Mocked<
    Kysely<any> & { executeTakeFirst: jest.Mock; execute: jest.Mock }
  >;

  beforeEach(async () => {
    dbMock = {
      selectFrom: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      insertInto: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      executeTakeFirst: jest.fn(),
      execute: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        AuthenService,
        JwtService,
        { provide: databaseProvider, useValue: dbMock },
      ],
    }).compile();

    service = module.get<AuthenService>(AuthenService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('login succeeded with exists user', async () => {
    const user = {
      id: v7(),
      createdAt: new Date(),
      profileImageUrl: null,
      username: 'test',
    };

    dbMock.executeTakeFirst.mockResolvedValue(user);

    const result = await service.login(user.username);

    expect(result).toBeDefined();
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();

    expect(dbMock.selectFrom).toHaveBeenCalledWith('user');
    expect(dbMock.executeTakeFirst).toHaveBeenCalled();
  });

  it('login succeeded with new user', async () => {
    const user = {
      id: v7(),
      createdAt: new Date(),
      profileImageUrl: null,
      username: 'test',
    };

    dbMock.executeTakeFirst.mockResolvedValue(undefined);
    dbMock.execute.mockResolvedValue([]);

    const result = await service.login(user.username);

    expect(result).toBeDefined();
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();

    expect(dbMock.selectFrom).toHaveBeenCalledWith('user');
    expect(dbMock.executeTakeFirst).toHaveBeenCalled();

    expect(dbMock.insertInto).toHaveBeenCalledWith('user');
    expect(dbMock.execute).toHaveBeenCalled();
  });

  it('login failed', async () => {
    const err = new Error('login failed');
    dbMock.executeTakeFirst.mockRejectedValue(err);
    expect(async () => await service.login('user')).rejects.toThrow(err);
  });

  it('refresh token succeeded', async () => {
    const user = {
      id: v7(),
      username: 'test',
    };
    const { refreshToken: token } = jwtService.encodeJwt(user.id);

    dbMock.executeTakeFirst.mockResolvedValue(user);

    const { accessToken, refreshToken } = await service.refreshToken(token);
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();

    expect(dbMock.selectFrom).toHaveBeenCalledWith('user');
    expect(dbMock.executeTakeFirst).toHaveBeenCalled();
  });

  it('refresh token failed: invalid token', async () => {
    const user = {
      id: v7(),
      username: 'test',
    };
    const { accessToken: token } = jwtService.encodeJwt(user.id);

    expect(async () => await service.refreshToken(token)).rejects.toThrow(
      new Error('refreshToken is invalid'),
    );
  });

  it('refresh token failed: user is not found', async () => {
    const user = {
      id: v7(),
      username: 'test',
    };
    const { refreshToken: token } = jwtService.encodeJwt(user.id);

    dbMock.executeTakeFirst.mockResolvedValue(undefined);

    expect(async () => await service.refreshToken(token)).rejects.toThrow(
      new Error('user is not found'),
    );

    expect(dbMock.selectFrom).toHaveBeenCalledWith('user');
    expect(dbMock.executeTakeFirst).toHaveBeenCalled();
  });

  it('refresh token failed: database error', async () => {
    const user = {
      id: v7(),
      username: 'test',
    };
    const { refreshToken: token } = jwtService.encodeJwt(user.id);

    dbMock.executeTakeFirst.mockRejectedValue(new Error('database error'));

    expect(async () => await service.refreshToken(token)).rejects.toThrow();

    expect(dbMock.selectFrom).toHaveBeenCalledWith('user');
    expect(dbMock.executeTakeFirst).toHaveBeenCalled();
  });
});
