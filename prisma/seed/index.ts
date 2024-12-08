import { client } from './client';
import { seedCommunities } from './community';

async function main() {
  try {
    await seedCommunities();
    await client.$disconnect();
  } catch (error) {
    console.error(error);
    await client.$disconnect();
    process.exit(1);
  }
}

main();
