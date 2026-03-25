const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

const connectDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      console.log('📦 PostgreSQL Connected via Prisma');
      return;
    } catch (error) {
      console.log(`⏳ Database connection attempt ${i + 1}/${retries} failed. Retrying in 3s...`);
      console.log(`   Reason: ${error.message}`);
      
      if (i === retries - 1) {
        console.error('❌ Could not connect to database after multiple attempts.');
        console.error('💡 Tip: Go to console.neon.tech and check if your project is paused.');
        process.exit(1);
      }
      
      // Wait 3 seconds before retrying (gives Neon time to wake up)
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
};

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = { prisma, connectDB };
