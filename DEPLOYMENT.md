# EngiSuite Deployment Guide

## Problem
The original error was caused by `better-sqlite3` - a native Node.js module that requires C++ compilation tools (`make`, `node-gyp`, Python) which are not available on shared hosting.

## Solution
The project has been reconfigured to use MySQL for production (via `mysql2` - pure JavaScript, no compilation needed) while keeping SQLite for local development.

## Deployment Steps

## Hostinger Business Quick Path

Use the automated packaging flow:

```bash
npm run build:hostinger
```

Then follow:

- `HOSTINGER_BUSINESS_DEPLOYMENT.md`
- `deployment-package/hostinger-business/DEPLOY_HOSTINGER_BUSINESS.md`

### 1. Upload New Files to Server

Upload these modified files to your server:

**Modified files:**
- `package.json` - removed `@types/better-sqlite3`, updated `multer` to v2, added `mysql2`
- `package-lock.json` - regenerated without `better-sqlite3`
- `prisma/schema.prisma` - set to `sqlite` for local dev
- `prisma/schema.prisma.production` - MySQL version for production
- `.env.example` - updated with MySQL connection format

### 2. Delete Old Files on Server

**IMPORTANT:** Delete these files/folders on the server before uploading:
- `node_modules/` (delete entire folder)
- `package-lock.json` (delete this file)

### 3. Update Environment Variables on Server

Set these environment variables on your hosting panel:

```env
# MySQL Database
DATABASE_URL="mysql://u449943183_engisuite:YOUR_PASSWORD@localhost:3306/u449943183_engisuite"

# Other settings
NODE_ENV=production
PORT=8000
```

### 4. Switch to MySQL Schema on Server

Replace the Prisma schema with the production version:

```bash
# On server, run:
cp prisma/schema.prisma.production prisma/schema.prisma
```

Or manually edit `prisma/schema.prisma` and change:
```prisma
datasource db {
  provider = "mysql"  # Change from "sqlite" to "mysql"
  url      = env("DATABASE_URL")
}
```

### 5. Install Dependencies

```bash
npm install
```

This should now complete without the `better-sqlite3` error.

### 6. Generate Prisma Client

```bash
npx prisma generate
```

### 7. Run Database Migration

```bash
npx prisma migrate deploy
```

Or for first-time setup:
```bash
npx prisma migrate dev --name init
```

### 8. Start the Application

```bash
npm start
```

## Why This Works

| Component | Before | After |
|-----------|--------|-------|
| Database | SQLite (via `better-sqlite3`) | MySQL (via `mysql2`) |
| Native Compilation | Required (`make`, `gyp`) | Not required |
| Driver Type | Native C++ addon | Pure JavaScript |

## Troubleshooting

### If you still see `better-sqlite3` errors:

1. **Delete `node_modules` and `package-lock.json` on server:**
   ```bash
   rm -rf node_modules
   rm package-lock.json
   ```

2. **Re-upload `package-lock.json` from your local machine**

3. **Run `npm install` again**

### If MySQL connection fails:

1. Verify MySQL database exists in your hosting panel
2. Check DATABASE_URL format: `mysql://USER:PASSWORD@HOST:PORT/DATABASE`
3. Ensure the MySQL user has all privileges on the database

## Local Development

For local development, continue using SQLite:
- The `.env` file is configured for SQLite
- Run `npm run dev` as usual
- No MySQL needed locally
