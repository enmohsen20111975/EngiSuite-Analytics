import { execSync } from 'node:child_process';

const isProduction = process.env.NODE_ENV === 'production';
const skipDbSync = process.env.SKIP_DB_SYNC === 'true';
const runPrismaMigrations = process.env.RUN_PRISMA_MIGRATIONS === 'true';
const autoDbPushOnStart = process.env.AUTO_DB_PUSH_ON_START === 'true';

function run(command) {
  execSync(command, { stdio: 'inherit' });
}

try {
  run('npx prisma generate');

  if (skipDbSync) {
    console.log('[prepare-db] SKIP_DB_SYNC=true -> skipping database sync/migrations.');
    process.exit(0);
  }

  if (isProduction) {
    if (runPrismaMigrations) {
      console.log('[prepare-db] RUN_PRISMA_MIGRATIONS=true -> running prisma migrate deploy.');
      run('npx prisma migrate deploy');
    } else if (autoDbPushOnStart) {
      console.log('[prepare-db] AUTO_DB_PUSH_ON_START=true -> running prisma db push.');
      run('npx prisma db push');
    } else {
      console.log('[prepare-db] Production mode -> skipping automatic schema changes.');
      console.log('[prepare-db] Set RUN_PRISMA_MIGRATIONS=true or AUTO_DB_PUSH_ON_START=true to automate DB setup.');
    }
  } else {
    console.log('[prepare-db] Development mode -> running prisma db push.');
    run('npx prisma db push');
  }
} catch (error) {
  console.error('[prepare-db] Warning: DB preparation failed:', error.message);
  console.error('[prepare-db] Server will still start — check DATABASE_URL in environment variables.');
  // Do NOT exit(1) — let the server start even if DB prep fails
}
