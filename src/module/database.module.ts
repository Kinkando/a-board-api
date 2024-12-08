import { Module } from '@nestjs/common';
import { Kysely, PostgresDialect } from 'kysely';
import { DB } from 'kysely-codegen';
import { Pool } from 'pg';

export const databaseProvider = 'DATABASE';

@Module({
  providers: [
    {
      provide: databaseProvider,
      useFactory: async () => {
        return new Kysely<DB>({
          dialect: new PostgresDialect({
            pool: new Pool({
              connectionString: process.env.DATABASE_URL,
            }),
          }),
        });
      },
    },
  ],
  exports: [databaseProvider],
})
export class DatabaseModule {}
