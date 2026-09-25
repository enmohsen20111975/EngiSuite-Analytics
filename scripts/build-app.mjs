import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const frontendDir = join(rootDir, 'frontend-react');

function run(command, cwd = rootDir) {
  execSync(command, {
    cwd,
    stdio: 'inherit',
    env: {
      ...process.env,
      NPM_CONFIG_PRODUCTION: 'false',
      npm_config_production: 'false',
    },
  });
}

function ensureRootBuildDeps() {
  const tscBinary = join(rootDir, 'node_modules', '.bin', process.platform === 'win32' ? 'tsc.cmd' : 'tsc');

  if (!existsSync(tscBinary)) {
    console.log('[build-app] Root build dependencies are missing. Installing dev dependencies...');
    run('npm install --include=dev --no-fund --no-audit');
  }
}

function ensureFrontendDeps() {
  const frontendPackageJson = join(frontendDir, 'package.json');
  const frontendNodeModules = join(frontendDir, 'node_modules');
  const viteBinary = join(frontendNodeModules, '.bin', process.platform === 'win32' ? 'vite.cmd' : 'vite');

  if (!existsSync(frontendPackageJson)) {
    throw new Error('frontend-react/package.json was not found.');
  }

  if (!existsSync(frontendNodeModules) || !existsSync(viteBinary)) {
    console.log('[build-app] Frontend dependencies are missing. Installing frontend dependencies...');
    run('npm install --include=dev --no-fund --no-audit', frontendDir);
  }
}

try {
  const distDir = join(rootDir, 'dist');
  if (existsSync(distDir)) {
    rmSync(distDir, { recursive: true, force: true });
  }

  ensureRootBuildDeps();
  ensureFrontendDeps();

  console.log('[build-app] Building TypeScript server...');
  run('npm run build:server');

  console.log('[build-app] Building React frontend...');
  run('npm run build:client');
} catch (error) {
  console.error('[build-app] Build failed:', error.message);
  process.exit(1);
}
