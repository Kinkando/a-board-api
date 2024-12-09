import { Inject, Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { DB } from 'kysely-codegen';
import { databaseProvider } from '../module/database.module';

@Injectable()
export class CommunityService {
  constructor(@Inject(databaseProvider) private readonly db: Kysely<DB>) {}

  async getCommunities() {
    const communities = await this.db
      .selectFrom('community')
      .select(['id', 'name'])
      .execute();
    return communities.map((community) => ({
      ...community,
      id: Number(community.id),
    }));
  }
}
