import { PrismaClient } from '@prisma/client';

export const client = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'stdout',
      level: 'error',
    },
    {
      emit: 'stdout',
      level: 'info',
    },
    {
      emit: 'stdout',
      level: 'warn',
    },
  ],
});

client.$on('query', (e) => {
  console.log({
    target: e.target,
    query: e.query,
    params: e.params,
    duration: `${e.duration} ms`,
  });
});
