#!/bin/bash

echo "🚀 AUTOMATED PRODUCTION SETUP"
echo "============================="

# Deploy code changes
echo "📦 Deploying code..."
npm run build && vercel --prod

# Test endpoints
echo "🧪 Testing production endpoints..."
curl -s https://testingvala.com/api/health | jq '.'

echo ""
echo "⚠️  MANUAL STEPS STILL REQUIRED:"
echo "================================"
echo ""
echo "1. SUPABASE (2 minutes):"
echo "   → Open: https://supabase.com/dashboard"
echo "   → Go to SQL Editor"
echo "   → Copy/paste: production-supabase-config.sql"
echo "   → Run the SQL"
echo "   → Authentication > Settings > Turn OFF email confirmations"
echo "   → Authentication > URL Config > Add: https://testingvala.com/auth/verify"
echo ""
echo "2. ZEPTOMAIL (1 minute):"
echo "   → Open: https://www.zoho.com/zeptomail/"
echo "   → Settings > Sandbox > Turn OFF"
echo "   → Domain > Verify: testingvala.com"
echo ""
echo "✅ After manual steps, test: https://testingvala.com"