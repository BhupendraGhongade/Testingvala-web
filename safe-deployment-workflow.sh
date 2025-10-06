#!/bin/bash

# 🚀 SAFE PRODUCTION DEPLOYMENT WORKFLOW
# This script ensures safe deployment without contaminating environments

set -e  # Exit on any error

echo "🚀 TestingVala Safe Production Deployment"
echo "========================================"

# 1. Safety Check - Verify CLI is unlinked
echo "🔍 Step 1: Checking CLI status..."
LINKED_PROJECT=$(supabase projects list | grep "●" | awk '{print $4}' || echo "")

if [ ! -z "$LINKED_PROJECT" ]; then
    echo "❌ ERROR: CLI is linked to project: $LINKED_PROJECT"
    echo "🔧 Run: supabase unlink"
    exit 1
fi

echo "✅ CLI is safely unlinked"

# 2. Verify local environment is running
echo "🔍 Step 2: Checking local Supabase..."
LOCAL_STATUS=$(supabase status | grep "API URL" | grep "127.0.0.1" || echo "")

if [ -z "$LOCAL_STATUS" ]; then
    echo "❌ ERROR: Local Supabase not running"
    echo "🔧 Run: supabase start"
    exit 1
fi

echo "✅ Local Supabase is running"

# 3. Backup production (safety measure)
echo "🔍 Step 3: Creating production backup..."
BACKUP_FILE="production-backup-$(date +%Y%m%d-%H%M%S).sql"

echo "📦 Backing up production to: $BACKUP_FILE"
supabase db dump --project-ref qxsardezvxsquvejvsso > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Production backup created: $BACKUP_FILE"
else
    echo "❌ ERROR: Failed to create backup"
    exit 1
fi

# 4. Temporary link for deployment
echo "🔗 Step 4: Temporarily linking to production..."
supabase link --project-ref qxsardezvxsquvejvsso

if [ $? -ne 0 ]; then
    echo "❌ ERROR: Failed to link to production"
    exit 1
fi

echo "✅ Temporarily linked to production"

# 5. Deploy to production
echo "🚀 Step 5: Deploying to production..."
echo "⚠️  This will update the production database"
read -p "Continue with deployment? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled by user"
    supabase unlink
    exit 1
fi

# Deploy database changes
supabase db push

if [ $? -ne 0 ]; then
    echo "❌ ERROR: Deployment failed"
    echo "🔧 Manual intervention required"
    echo "🔗 CLI is still linked - run 'supabase unlink' manually"
    exit 1
fi

echo "✅ Database deployment successful"

# 6. CRITICAL: Immediately unlink
echo "🔒 Step 6: Unlinking from production (CRITICAL)..."
supabase unlink

if [ $? -eq 0 ]; then
    echo "✅ Successfully unlinked from production"
else
    echo "❌ ERROR: Failed to unlink - MANUAL ACTION REQUIRED"
    echo "🚨 RUN IMMEDIATELY: supabase unlink"
    exit 1
fi

# 7. Final verification
echo "🔍 Step 7: Final safety verification..."
FINAL_CHECK=$(supabase projects list | grep "●" || echo "")

if [ ! -z "$FINAL_CHECK" ]; then
    echo "❌ ERROR: CLI is still linked after deployment"
    echo "🚨 CRITICAL: Run 'supabase unlink' immediately"
    exit 1
fi

echo "✅ Final verification passed - CLI is unlinked"

# 8. Success summary
echo ""
echo "🎉 DEPLOYMENT COMPLETE & SECURE"
echo "================================"
echo "✅ Production updated successfully"
echo "✅ CLI safely unlinked from production"  
echo "✅ Local environment remains isolated"
echo "✅ Backup created: $BACKUP_FILE"
echo ""
echo "🔒 Your environments are secure!"
echo "💡 Resume local development with: npm run dev"

exit 0