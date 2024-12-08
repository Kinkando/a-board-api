import { client } from './client';

export async function seedCommunities() {
  const communities = [
    'History',
    'Food',
    'Pets',
    'Health',
    'Fashion',
    'Exercise',
    'Others',
  ];

  for (let i = 0; i < communities.length; i++) {
    const community = communities[i];
    const data = await client.community.upsert({
      where: {
        id: i + 1,
      },
      update: {},
      create: {
        name: community,
      },
    });
    console.log('community', data);
  }
}
