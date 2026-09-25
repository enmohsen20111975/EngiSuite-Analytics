#!/usr/bin/env bash
set -euo pipefail

npm ci --omit=dev
npx prisma generate
npm run db:deploy
npx pm2 start ecosystem.config.cjs --env production --update-env
npx pm2 save
npx pm2 status
