# How to Deploy TeenChat to Vercel with Database Migrations

## Step-by-Step Deployment Guide

### 1. Update Local Environment (Already Done ✅)
- Updated Prisma schema to use PostgreSQL
- Connected Neon database
- Updated package.json with auto-migration script

### 2. Run Migrations Locally (Do This Now)

First, update your `.env` file with the Neon database URL:
```env
DATABASE_URL="postgresql://neondb_owner:npg_ITNehzgfa32k@ep-dawn-shape-a48ndbem-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="teenchat-secret-key-2025-change-in-production"
```

Then run:
```bash
npx prisma migrate dev --name init_postgres
```

This creates the migration files and applies them to your Neon database.

### 3. Commit and Push Changes

```bash
git add .
git commit -m "Configure PostgreSQL and add auto-migration"
git push origin main
```

### 4. Configure Vercel Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add these variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_ITNehzgfa32k@ep-dawn-shape-a48ndbem-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Production |
| `NEXTAUTH_URL` | `https://your-preview.vercel.app` | Preview |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` | Production, Preview, Development |

### 5. Deploy to Vercel

**Option A: Automatic Deployment**
- Vercel will automatically deploy when you push to GitHub
- The `postinstall` script will run migrations automatically

**Option B: Manual Deployment**
1. Go to your Vercel dashboard
2. Click **Deployments**
3. Click **Deploy** or **Redeploy**

### 6. Verify Deployment

After deployment completes:
1. Check the deployment logs for migration success
2. Visit your app URL
3. Try creating an account and chatting

## Alternative: Manual Migration in Vercel

If automatic migrations don't work, you can run them manually:

### Using Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Pull environment variables
vercel env pull

# Run migrations
npx prisma migrate deploy
```

### Using Vercel Dashboard:

1. Go to your project → **Settings** → **Functions**
2. Add a serverless function to run migrations
3. Or use the Vercel CLI method above

## Troubleshooting

### If migrations fail:
1. Check Vercel deployment logs
2. Verify DATABASE_URL is set correctly
3. Ensure Neon database is accessible
4. Check that migration files are committed to Git

### If app doesn't start:
1. Check all environment variables are set
2. Verify NEXTAUTH_SECRET is set
3. Check build logs for errors

## Current Status

✅ Prisma schema updated to PostgreSQL
✅ Package.json configured for auto-migrations
✅ Neon database connected
⏳ Need to run local migration
⏳ Need to commit and push changes
⏳ Need to configure Vercel environment variables
⏳ Need to deploy to Vercel

## Next Steps

1. Update your `.env` file (see above)
2. Run: `npx prisma migrate dev --name init_postgres`
3. Commit: `git add . && git commit -m "Add PostgreSQL migrations"`
4. Push: `git push origin main`
5. Configure Vercel environment variables
6. Deploy will happen automatically!
