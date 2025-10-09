
# 🚀 PRODUCTION DEPLOYMENT COMMANDS

## 1️⃣ PRE-DEPLOYMENT CHECKS
npm run security:check
npm run build:prod
npm test

## 2️⃣ DATABASE SCHEMA MIGRATION (Docker → Production)
# Backup current production database
npm run db:backup

# Generate migration from local changes
supabase db diff -f migration_$(date +%Y%m%d_%H%M%S)

# Apply migrations to production
supabase db push --linked

# Verify migration success
supabase db status --linked

## 3️⃣ ENVIRONMENT VARIABLES (Vercel)
# Set production environment variables
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add ZEPTO_API_KEY production
vercel env add ZEPTO_FROM_EMAIL production
vercel env add VITE_ADMIN_EMAIL production
vercel env add VITE_ADMIN_PASSWORD production

## 4️⃣ BUILD & DEPLOY
# User site
npm run build
vercel --prod

# Admin site
cd Testingvala-admin
npm run build
vercel --prod

## 5️⃣ POST-DEPLOYMENT VERIFICATION
# Test magic link functionality
curl -X POST https://testingvala.com/api/send-magic-link \
  -H "Content-Type: application/json" \
  -d '{"email": "test@testingvala.com"}'

# Test admin login
# Navigate to admin URL and verify login works

## 6️⃣ ROLLBACK PLAN (if needed)
# Revert database migration
supabase db reset --linked
# Restore from backup
# Redeploy previous version

## 🔄 REGULAR DEPLOYMENT WORKFLOW
# Run this before every production release:
npm run pre-prod-audit
npm run db:backup
supabase db push --linked
npm run build
vercel --prod
