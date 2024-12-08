import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { v7 } from 'uuid';
import { JwtService } from './jwt.service';

describe('JwtService', () => {
  let service: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [JwtService],
    }).compile();

    service = module.get<JwtService>(JwtService);
  });

  it('encode and decode jwt', async () => {
    const hour = 1000 * 60 * 60;
    expect(service).toBeDefined();
    const userId = v7();
    const jwt = service.encodeJwt(userId);
    const accessJwt = service.decodeJwt(jwt.accessToken);
    const refreshJwt = service.decodeJwt(jwt.refreshToken);
    const now = new Date();
    const accessExpiredAt = Math.floor(
      new Date().setTime(now.getTime() + hour) / 1000,
    );
    const refreshExpiredAt = Math.floor(
      new Date().setTime(now.getTime() + 24 * hour) / 1000,
    );
    expect(accessJwt.userId).toBe(userId);
    expect(accessJwt.type).toBe('access');
    expect(accessJwt.exp).toBe(accessExpiredAt);
    expect(refreshJwt.userId).toBe(userId);
    expect(refreshJwt.type).toBe('refresh');
    expect(refreshJwt.exp).toBe(refreshExpiredAt);
  });
});
