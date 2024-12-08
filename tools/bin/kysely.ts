import { config } from 'dotenv';
import { exec } from 'child_process';

config();

function kyselyCodegen() {
  exec(
    `pnpm kysely-codegen --exclude-pattern _prisma_migrations --url ${process.env.DATABASE_URL}`,
    (err, stdout) => {
      if (err) {
        console.error(err.message);
      }
      console.info(stdout);
    },
  );
}

kyselyCodegen();
