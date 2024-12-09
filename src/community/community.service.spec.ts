import { Kysely } from 'kysely';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { CommunityService } from './community.service';
import { databaseProvider } from '../module/database.module';

describe('CommunityService', () => {
  let service: CommunityService;
  let dbMock: jest.Mocked<Kysely<any> & { execute: jest.Mock }>;

  beforeEach(async () => {
    dbMock = {
      selectFrom: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        CommunityService,
        { provide: databaseProvider, useValue: dbMock },
      ],
    }).compile();

    service = module.get<CommunityService>(CommunityService);
  });

  it('get communities success', async () => {
    const communities = [
      {
        id: 1,
        name: 'LifeStyle',
      },
      {
        id: 2,
        name: 'Pets',
      },
    ];
    dbMock.execute.mockResolvedValue(communities);

    const data = await service.getCommunities();

    expect(data).toBeDefined();
    expect(data.length).toBe(communities.length);

    expect(dbMock.selectFrom).toHaveBeenCalledWith('community');
    expect(dbMock.execute).toHaveBeenCalled();
  });

  it('get communities failed', async () => {
    dbMock.execute.mockRejectedValue(new Error('database error'));

    expect(async () => await service.getCommunities()).rejects.toThrow();

    expect(dbMock.selectFrom).toHaveBeenCalledWith('community');
    expect(dbMock.execute).toHaveBeenCalled();
  });
});
