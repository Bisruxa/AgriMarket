require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    const result = await prisma.$queryRaw`SELECT 1 AS ok`;
    console.log('Database connection OK:', result);
  } catch (err) {
    console.error('Database connection FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
