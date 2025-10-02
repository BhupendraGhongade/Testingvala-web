#!/bin/bash

# PRODUCTION DEPLOYMENT SCRIPT
# Deploys all fixes for magic link authentication

echo "🚀 DEPLOYING PRODUCTION FIXES"
echo "=============================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Error: Vercel CLI not installed"
    echo "Install with: npm i -g vercel"
    exit 1
fi

echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"

echo "🚀 Deploying to production..."
vercel --prod

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    exit 1
fi

echo "✅ Deployment successful"

echo ""
echo "🔧 MANUAL STEPS REQUIRED:"
echo "========================="
echo ""
echo "1. SUPABASE SETUP:"
echo "   → Go to Supabase Dashboard > SQL Editor"
echo "   → Run the SQL from: production-supabase-config.sql"
echo "   → Go to Authentication > Settings"
echo "   → Set Site URL: https://testingvala.com"
echo "   → Disable email confirmations"
echo ""
echo "2. ZEPTOMAIL SETUP:"
echo "   → Go to ZeptoMail Dashboard"
echo "   → Disable sandbox mode"
echo "   → Verify domain: testingvala.com"
echo "   → Configure DNS records (SPF, DKIM, DMARC)"
echo ""
echo "3. VERCEL ENVIRONMENT VARIABLES:"
echo "   → Go to Vercel Dashboard > Settings > Environment Variables"
echo "   → Ensure all variables are set for Production environment"
echo ""
echo "4. TEST THE FLOW:"
echo "   → Go to https://testingvala.com"
echo "   → Try the magic link authentication"
echo "   → Check Vercel function logs"
echo "   → Check Supabase logs"
echo "   → Check ZeptoMail delivery logs"
echo ""
echo "🎉 Deployment complete!"
echo "📋 See PRODUCTION_AUDIT_FIXES.md for detailed instructions"