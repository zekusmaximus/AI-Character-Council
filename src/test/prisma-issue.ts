import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  await prisma.$transaction(async (tx) => {
    await tx.personalityTrait.create({
      data: {
        characterId: 'test',
        name: 'test',
        value: 'test'
      }
    });
  });
}

test().catch(console.error); 