import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { ConfigModule } from '@nestjs/config';
import { Kysely } from 'kysely';
import { v7 } from 'uuid';
import { NotFoundException } from '@nestjs/common';
import { databaseProvider } from '../module/database.module';

describe('UserService', () => {
  let service: UserService;
  let dbMock: jest.Mocked<Kysely<any> & { executeTakeFirst: jest.Mock }>;

  beforeEach(async () => {
    dbMock = {
      selectFrom: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      executeTakeFirst: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [UserService, { provide: databaseProvider, useValue: dbMock }],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('get user success', async () => {
    const mockUser = { id: v7(), username: 'test' };

    dbMock.executeTakeFirst.mockResolvedValue(mockUser);

    const user = await service.getUser(mockUser.id);

    expect(user).toBeDefined();
    expect(user).toBe(mockUser);
    expect(user.username).toBe(mockUser.username);

    expect(dbMock.selectFrom).toHaveBeenCalledWith('user');
    expect(dbMock.executeTakeFirst).toHaveBeenCalled();
  });

  it('get user failed: user is not found', async () => {
    dbMock.executeTakeFirst.mockResolvedValue(undefined);

    expect(async () => await service.getUser(v7())).rejects.toThrow(
      new NotFoundException(),
    );

    expect(dbMock.selectFrom).toHaveBeenCalledWith('user');
    expect(dbMock.executeTakeFirst).toHaveBeenCalled();
  });

  it('get user failed: database error', async () => {
    dbMock.executeTakeFirst.mockRejectedValue(new Error('database error'));

    expect(async () => await service.getUser(v7())).rejects.toThrow();

    expect(dbMock.selectFrom).toHaveBeenCalledWith('user');
    expect(dbMock.executeTakeFirst).toHaveBeenCalled();
  });
});
