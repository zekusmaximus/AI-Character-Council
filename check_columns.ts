const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$queryRaw`SELECT id, "personalityTraits", "characterSheet" FROM Character LIMIT 5;`;
    console.log('Query successful. Sample data:');
    console.log(result);
  } catch (error) {
    console.error('Error executing query:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
