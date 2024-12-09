import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';

describe('CommunityController', () => {
  let app: INestApplication;
  let controller: CommunityController;
  let communityService: jest.Mocked<CommunityService>;

  beforeEach(async () => {
    communityService = {
      getCommunities: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      controllers: [CommunityController],
      providers: [
        {
          provide: CommunityService,
          useValue: communityService,
        },
      ],
    }).compile();

    controller = module.get<CommunityController>(CommunityController);
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
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
    communityService.getCommunities.mockResolvedValue(communities);
    const data = await controller.getCommunities();

    expect(data).toBeDefined();
    expect(data.length).toBe(communities.length);

    expect(communityService.getCommunities).toHaveBeenCalled();
  });

  it('get communities failed', async () => {
    communityService.getCommunities.mockRejectedValue(new Error('error'));
    expect(async () => await controller.getCommunities()).rejects.toThrow();
    expect(communityService.getCommunities).toHaveBeenCalled();
  });
});
