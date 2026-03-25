# Hostinger Business Deployment Guide

This project is now prepared for Hostinger Business deployment with a repeatable package build.

## GitHub Auto-Deploy (No Terminal)

If Hostinger deploys directly from GitHub and you do not have terminal access, configure deployment in Hostinger panel like this:

1. Framework: Node.js / Express
2. Install command: `npm ci --omit=dev`
3. Build command: `npm run build`
4. Start command: `npm start`

Then set these environment variables in Hostinger panel:

```env
NODE_ENV=production
PORT=8000
DATABASE_URL="mysql://DB_USER:DB_PASSWORD@localhost:3306/DB_NAME"
JWT_SECRET=your-secret
SESSION_SECRET=your-session-secret
AUTO_DB_PUSH_ON_START=true
RUN_PRISMA_MIGRATIONS=false
SKIP_DB_SYNC=false
```

`AUTO_DB_PUSH_ON_START=true` is the key for no-terminal deployment. It lets the app run `prisma db push` automatically during startup.

The root `npm run build` is now Hostinger-safe:

- It installs missing root dev dependencies if TypeScript is missing.
- It installs missing `frontend-react` dependencies if Vite is missing.
- It then builds both backend and frontend.

So warnings like `sh: tsc: command not found` should be resolved after redeploying the updated code.

## 1. Build and package for Hostinger

Run from project root:

```bash
npm run build:hostinger
```

This command builds server and frontend, then generates:

- deployment-package/hostinger-business

The folder contains:

- dist server build
- frontend-react/dist frontend assets
- prisma schema files
- package.json and lockfile
- ecosystem.config.cjs
- .env.production.example
- start-production.sh
- DEPLOY_HOSTINGER_BUSINESS.md quick instructions

## 2. Upload package to Hostinger

Upload everything inside deployment-package/hostinger-business to your app folder on Hostinger.

## 3. Configure environment variables

On server:

1. Copy .env.production.example to .env
2. Set real values for:
   - DATABASE_URL (MySQL)
   - JWT_SECRET
   - SESSION_SECRET
   - CORS_ALLOW_ORIGINS
   - FRONTEND_URL
   - API_URL

Use this exact DATABASE_URL format:

```env
DATABASE_URL="mysql://DB_USER:DB_PASSWORD@localhost:3306/DB_NAME"
```

Important for Hostinger:

- `DB_USER` is the MySQL username (often prefixed, like `u449xxxxxx_user`).
- `DB_NAME` is the MySQL database name (also prefixed, like `u449xxxxxx_db`).
- The password must be the MySQL user password from Hostinger Databases section.
- Do not reuse your Hostinger account password unless that is exactly your MySQL password.

## 4. Install and start

On Hostinger terminal (inside uploaded folder):

```bash
bash start-production.sh
```

If you use Hostinger Git auto-deploy and not `start-production.sh`, run this once after deploy:

```bash
npm ci --omit=dev
npx prisma generate
npm run db:deploy
npx pm2 start ecosystem.config.cjs --env production --update-env
```

## 5. Startup command in Hostinger

Set startup command to:

```bash
npx pm2 restart ecosystem.config.cjs --env production --update-env
```

## 6. Validate deployment

- Health check: /health
- API base: /api
- Frontend loads from root /

## Notes

- Incomplete courses are now automatically marked as Coming soon in the learning page UI.
- Certifications with missing required content are automatically shown as Coming soon.
- `postinstall` no longer runs `prisma db push`, so wrong DB credentials will not break dependency installation.
- For no-terminal Hostinger auto-deploy, use `AUTO_DB_PUSH_ON_START=true` in environment variables.

## Troubleshooting P1000 (Your current error)

If you see:

`P1000: Authentication failed against database server at localhost`

Do this in order:

1. In Hostinger -> Databases -> Management, create a fresh MySQL user password.
2. Assign that user to the target database.
3. Update `DATABASE_URL` with the exact new username/password/database name.
4. In Hostinger terminal, test with:

```bash
npx prisma db pull
```

5. If successful, run:

```bash
npm run db:deploy
```

6. Restart app:

```bash
npx pm2 restart ecosystem.config.cjs --env production --update-env
```

## Troubleshooting build error: `tsc: command not found`

If Hostinger shows:

`sh: tsc: command not found`

That means the platform installed production dependencies only, so TypeScript was missing.

This repository now handles that automatically during `npm run build`, so after pushing the latest code you can redeploy again.

The `eslint-visitor-keys` `EBADENGINE` output is only a warning and is not the build blocker.
