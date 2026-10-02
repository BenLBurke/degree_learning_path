import { PrismaClient } from '@prisma/client';
import { mitCurriculum } from '../lib/degree/mitCurriculum';

const prisma = new PrismaClient();

async function main() {
  console.log('Seed complete - knowledge states are created on user registration');
  // Knowledge states are created when students complete onboarding
  // This seed file can be used to create test data

  const allNodes = mitCurriculum.courses.flatMap(c => c.nodes.map(n => n.id));
  console.log(`Curriculum has ${mitCurriculum.courses.length} courses and ${allNodes.length} total nodes`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
