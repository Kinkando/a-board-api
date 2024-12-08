import { Inject, Injectable, Logger } from '@nestjs/common';
import { Kysely, sql } from 'kysely';
import { DB } from 'kysely-codegen';
import { v7 } from 'uuid';
import { JwtService } from '../jwt/jwt.service';
import { databaseProvider } from '../module/database.module';

@Injectable()
export class AuthenService {
  private readonly logger = new Logger('AuthenService');

  constructor(
    @Inject(databaseProvider) private readonly db: Kysely<DB>,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string) {
    this.logger.log(`login: ${JSON.stringify({ username })}`);

    const user = await this.db
      .selectFrom('user')
      .select(['id', 'profileImageUrl', 'username', 'createdAt'])
      .where(sql<string>`lower(username)`, '=', username.toLocaleLowerCase())
      .executeTakeFirst();

    const userId = user?.id ?? v7();
    if (!user) {
      const userData = {
        id: userId,
        username,
        profileImageUrl: null,
        createdAt: new Date(),
      };
      await this.db.insertInto('user').values(userData).execute();
    }

    return this.jwtService.encodeJwt(userId);
  }

  async refreshToken(token: string) {
    const jwt = this.jwtService.decodeJwt(token);

    if (jwt.type !== 'refresh') {
      throw Error('refreshToken is invalid');
    }

    const user = await this.db
      .selectFrom('user')
      .select(['id', 'username'])
      .where('id', '=', jwt.userId)
      .executeTakeFirst();

    if (!user) {
      throw Error('user is not found');
    }

    return this.jwtService.encodeJwt(user.id);
  }
}
