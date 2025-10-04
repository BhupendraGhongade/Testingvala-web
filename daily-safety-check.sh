#!/bin/bash

# 🛡️ DAILY SAFETY CHECK - Verify Environment Separation
# Run this daily to ensure your environments remain isolated

echo "🛡️ TestingVala Daily Safety Check"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ISSUES_FOUND=0

# 1. Check CLI Link Status
echo "🔍 Checking Supabase CLI link status..."
LINKED_PROJECT=$(supabase projects list | grep "●" | awk '{print $4}' || echo "")

if [ ! -z "$LINKED_PROJECT" ]; then
    echo -e "${RED}❌ CRITICAL: CLI is linked to: $LINKED_PROJECT${NC}"
    echo -e "${YELLOW}🔧 Fix: supabase unlink${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo -e "${GREEN}✅ CLI is safely unlinked${NC}"
fi

# 2. Check Local Supabase Status
echo "🔍 Checking local Supabase status..."
LOCAL_API=$(supabase status 2>/dev/null | grep "API URL" | grep "127.0.0.1" || echo "")

if [ -z "$LOCAL_API" ]; then
    echo -e "${YELLOW}⚠️  Local Supabase not running${NC}"
    echo -e "${YELLOW}🔧 Start with: supabase start${NC}"
else
    echo -e "${GREEN}✅ Local Supabase running on localhost${NC}"
fi

# 3. Check Environment Files
echo "🔍 Checking environment files..."

# Check main .env file
if [ -f ".env" ]; then
    LOCAL_URL=$(grep "VITE_SUPABASE_URL" .env | grep "127.0.0.1" || echo "")
    if [ ! -z "$LOCAL_URL" ]; then
        echo -e "${GREEN}✅ Main .env uses local URL${NC}"
    else
        echo -e "${RED}❌ Main .env may have production URL${NC}"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
else
    echo -e "${YELLOW}⚠️  No .env file found${NC}"
fi

# Check admin .env file
if [ -f "Testingvala-admin/.env" ]; then
    ADMIN_LOCAL_URL=$(grep "VITE_SUPABASE_URL" Testingvala-admin/.env | grep "127.0.0.1" || echo "")
    if [ ! -z "$ADMIN_LOCAL_URL" ]; then
        echo -e "${GREEN}✅ Admin .env uses local URL${NC}"
    else
        echo -e "${RED}❌ Admin .env may have production URL${NC}"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
else
    echo -e "${YELLOW}⚠️  No admin .env file found${NC}"
fi

# 4. Check for production keys in local files
echo "🔍 Checking for production keys in local files..."
PROD_KEYS=$(grep -r "qxsardezvxsquvejvsso" .env* 2>/dev/null | grep -v ".env.production" || echo "")

if [ ! -z "$PROD_KEYS" ]; then
    echo -e "${RED}❌ Production keys found in local files:${NC}"
    echo "$PROD_KEYS"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo -e "${GREEN}✅ No production keys in local files${NC}"
fi

# 5. Summary
echo ""
echo "📊 SAFETY CHECK SUMMARY"
echo "======================="

if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL CHECKS PASSED - ENVIRONMENTS ARE SECURE${NC}"
    echo -e "${GREEN}✅ Local and Production are properly isolated${NC}"
    echo -e "${GREEN}✅ Safe to continue development${NC}"
else
    echo -e "${RED}🚨 $ISSUES_FOUND ISSUE(S) FOUND${NC}"
    echo -e "${RED}⚠️  Please fix the issues above before continuing${NC}"
    echo -e "${YELLOW}💡 Need help? Check ENVIRONMENT_SEPARATION_COMPLETE.md${NC}"
fi

echo ""
echo "🔒 Environment Status:"
echo "- Local Development: $([ -z "$LOCAL_API" ] && echo "Not Running" || echo "Running Safely")"
echo "- CLI Link Status: $([ -z "$LINKED_PROJECT" ] && echo "Unlinked (Safe)" || echo "Linked to $LINKED_PROJECT (UNSAFE)")"
echo "- Issues Found: $ISSUES_FOUND"

exit $ISSUES_FOUND