import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Kysely } from 'kysely';
import { DB } from 'kysely-codegen';
import { databaseProvider } from '../module/database.module';

@Injectable()
export class UserService {
  private readonly logger = new Logger('UserService');

  constructor(@Inject(databaseProvider) private readonly db: Kysely<DB>) {}
  async getUser(userId: string) {
    const user = await this.db
      .selectFrom('user')
      .select(['id', 'profileImageUrl', 'username'])
      .where('id', '=', userId)
      .executeTakeFirst();

    if (!user) {
      this.logger.error(`getUser: user is not found`);
      throw new NotFoundException();
    }

    this.logger.log(`getUser: ${JSON.stringify(user)}`);
    return user;
  }
}
