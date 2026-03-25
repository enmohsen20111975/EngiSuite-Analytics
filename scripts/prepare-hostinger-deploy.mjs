import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync, chmodSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const outputDir = join(rootDir, 'deployment-package', 'hostinger-business');

const shouldBuild = process.argv.includes('--build');

const requiredPaths = [
  join(rootDir, 'dist'),
  join(rootDir, 'frontend-react', 'dist'),
  join(rootDir, 'prisma'),
  join(rootDir, 'package.json'),
  join(rootDir, 'package-lock.json'),
  join(rootDir, 'ecosystem.config.cjs'),
  join(rootDir, '.env.example'),
];

function assertRequirements() {
  const missing = requiredPaths.filter((path) => !existsSync(path));
  if (missing.length > 0) {
    throw new Error(`Missing required paths:\n${missing.join('\n')}`);
  }
}

function runBuild() {
  console.log('Building server and frontend...');
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
}

function copyIntoPackage() {
  if (existsSync(outputDir)) {
    rmSync(outputDir, { recursive: true, force: true });
  }

  mkdirSync(outputDir, { recursive: true });

  cpSync(join(rootDir, 'dist'), join(outputDir, 'dist'), { recursive: true });
  cpSync(join(rootDir, 'frontend-react', 'dist'), join(outputDir, 'frontend-react', 'dist'), { recursive: true });
  cpSync(join(rootDir, 'prisma'), join(outputDir, 'prisma'), {
    recursive: true,
    filter: (source) => !source.includes('migrations'),
  });

  cpSync(join(rootDir, 'package.json'), join(outputDir, 'package.json'));
  cpSync(join(rootDir, 'package-lock.json'), join(outputDir, 'package-lock.json'));
  cpSync(join(rootDir, 'ecosystem.config.cjs'), join(outputDir, 'ecosystem.config.cjs'));
  cpSync(join(rootDir, '.env.example'), join(outputDir, '.env.example'));

  writeFileSync(
    join(outputDir, '.env.production.example'),
    [
      'NODE_ENV=production',
      'PORT=8000',
      'DATABASE_URL="mysql://DB_USER:DB_PASSWORD@localhost:3306/DB_NAME"',
      'JWT_SECRET=change-me-in-production',
      'SESSION_SECRET=change-me-in-production',
      'FRONTEND_URL=https://your-domain.com',
      'API_URL=https://your-domain.com',
      'CORS_ALLOW_ORIGINS=https://your-domain.com',
    ].join('\n') + '\n'
  );

  const startScript = join(outputDir, 'start-production.sh');
  writeFileSync(
    startScript,
    [
      '#!/usr/bin/env bash',
      'set -euo pipefail',
      '',
      'npm ci --omit=dev',
      'npx prisma generate',
      'npm run db:deploy',
      'npx pm2 start ecosystem.config.cjs --env production --update-env',
      'npx pm2 save',
      'npx pm2 status',
    ].join('\n') + '\n'
  );

  try {
    chmodSync(startScript, 0o755);
  } catch {
    // Ignore on platforms that do not support chmod as expected.
  }

  writeFileSync(
    join(outputDir, 'DEPLOY_HOSTINGER_BUSINESS.md'),
    [
      '# Hostinger Business Quick Deploy',
      '',
      '1. Upload the full hostinger-business folder to your Hostinger app directory.',
      '2. Copy .env.production.example to .env and set real production values.',
      '3. Run: bash start-production.sh',
      '4. Set startup command in Hostinger to: npx pm2 restart ecosystem.config.cjs --env production --update-env',
      '5. Verify health endpoint: /health',
    ].join('\n') + '\n'
  );
}

try {
  if (shouldBuild) {
    runBuild();
  }

  assertRequirements();
  copyIntoPackage();

  console.log('Hostinger deployment package ready at:');
  console.log(outputDir);
} catch (error) {
  console.error('Failed to prepare Hostinger package:', error.message);
  process.exit(1);
}
