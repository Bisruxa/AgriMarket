const { PrismaClient } = require('@prisma/client');

/** One Prisma instance (nodemon hot-reload reuses global in dev). */
const globalForPrisma = global;

/**
 * Neon pooler: keep a small client pool per Node process.
 * @see https://www.prisma.io/docs/guides/database/neon
 */
function buildDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) return url;

  try {
    const parsed = new URL(url);
    const isPooler = parsed.hostname.includes('-pooler');

    if (!parsed.searchParams.has('connection_limit')) {
      parsed.searchParams.set(
        'connection_limit',
        process.env.DATABASE_CONNECTION_LIMIT || (isPooler ? '5' : '10'),
      );
    }
    if (!parsed.searchParams.has('pool_timeout')) {
      parsed.searchParams.set(
        'pool_timeout',
        process.env.DATABASE_POOL_TIMEOUT || '30',
      );
    }
    if (!parsed.searchParams.has('connect_timeout')) {
      parsed.searchParams.set('connect_timeout', '30');
    }
    if (isPooler && !parsed.searchParams.has('pgbouncer')) {
      parsed.searchParams.set('pgbouncer', 'true');
    }

    return parsed.toString();
  } catch {
    return url;
  }
}

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: { url: buildDatabaseUrl() },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * No-op: removed per-request SELECT 1 pings — they exhausted the Neon pool
 * (pool timeout / connection limit errors). Prisma reconnects on the next query.
 */
async function ensureDbConnection() {}

const connectDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      console.log('📦 PostgreSQL Connected via Prisma');
      return;
    } catch (error) {
      console.log(`⏳ Database connection attempt ${i + 1}/${retries} failed. Retrying in 3s...`);
      console.log(`   Reason: ${error.message}`);

      if (i === retries - 1) {
        console.error('❌ Could not connect to database after multiple attempts.');
        console.error('💡 Tip: Go to console.neon.tech and check if your project is paused.');
        console.error('💡 Use the *-pooler* host in DATABASE_URL with connection_limit=5');
        process.exit(1);
      }

      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
};

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = { prisma, connectDB, ensureDbConnection };
