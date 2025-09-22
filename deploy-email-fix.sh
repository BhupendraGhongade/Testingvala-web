#!/bin/bash

# PRODUCTION EMAIL FIX DEPLOYMENT SCRIPT
# This script will fix the magic link email issues and deploy to production

echo "🚀 TESTINGVALA PRODUCTION EMAIL FIX"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if required files exist
echo "1. CHECKING REQUIRED FILES..."
echo "-----------------------------"

if [ ! -f "fix-production-email.sql" ]; then
    print_error "fix-production-email.sql not found!"
    exit 1
fi

if [ ! -f "api/send-magic-link-production.js" ]; then
    print_error "api/send-magic-link-production.js not found!"
    exit 1
fi

if [ ! -f "diagnose-production-email.js" ]; then
    print_error "diagnose-production-email.js not found!"
    exit 1
fi

print_status "All required files found"
echo ""

# Check environment variables
echo "2. CHECKING ENVIRONMENT VARIABLES..."
echo "------------------------------------"

if [ -f ".env" ]; then
    source .env
    print_status ".env file loaded"
else
    print_warning ".env file not found - using system environment"
fi

# Check required variables
REQUIRED_VARS=("VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY" "ZEPTO_API_KEY")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    else
        print_status "$var is set"
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    print_error "Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    echo ""
    print_info "Please set these variables in your .env file or environment"
    exit 1
fi

echo ""

# Replace the main API file
echo "3. UPDATING API ENDPOINT..."
echo "---------------------------"

if [ -f "api/send-magic-link.js" ]; then
    cp "api/send-magic-link.js" "api/send-magic-link.js.backup"
    print_status "Backed up original API file"
fi

cp "api/send-magic-link-production.js" "api/send-magic-link.js"
print_status "Updated API endpoint with production-ready version"
echo ""

# Install dependencies if needed
echo "4. CHECKING DEPENDENCIES..."
echo "---------------------------"

if [ -f "package.json" ]; then
    if ! npm list @supabase/supabase-js >/dev/null 2>&1; then
        print_info "Installing @supabase/supabase-js..."
        npm install @supabase/supabase-js
    fi
    print_status "Dependencies verified"
else
    print_warning "No package.json found - assuming dependencies are installed"
fi

echo ""

# Run diagnostics
echo "5. RUNNING DIAGNOSTICS..."
echo "-------------------------"

print_info "Running production email diagnostics..."
node diagnose-production-email.js

echo ""

# Instructions for manual steps
echo "6. MANUAL STEPS REQUIRED..."
echo "---------------------------"

print_warning "Please complete these steps manually:"
echo ""

print_info "STEP 1: Run SQL Script in Supabase"
echo "  1. Go to your Supabase Dashboard"
echo "  2. Navigate to SQL Editor"
echo "  3. Copy and paste the contents of 'fix-production-email.sql'"
echo "  4. Click 'Run' to execute the script"
echo ""

print_info "STEP 2: Verify ZeptoMail Configuration"
echo "  1. Go to ZeptoMail Dashboard (https://www.zoho.com/zeptomail/)"
echo "  2. Check that 'testingvala.com' domain is verified"
echo "  3. Ensure Sandbox Mode is DISABLED"
echo "  4. Verify API key is active and correct"
echo ""

print_info "STEP 3: Update Vercel Environment Variables"
echo "  1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables"
echo "  2. Add/Update these variables:"
echo "     - VITE_SUPABASE_URL = $VITE_SUPABASE_URL"
echo "     - VITE_SUPABASE_ANON_KEY = $VITE_SUPABASE_ANON_KEY"
echo "     - ZEPTO_API_KEY = $ZEPTO_API_KEY"
echo "     - ZEPTO_FROM_EMAIL = info@testingvala.com"
echo "     - ZEPTO_FROM_NAME = TestingVala"
echo ""

print_info "STEP 4: Deploy to Vercel"
echo "  Run: vercel --prod"
echo "  Or push to your main branch if auto-deployment is enabled"
echo ""

print_info "STEP 5: Test the Fix"
echo "  1. Go to your production site"
echo "  2. Try to sign in with a NEW email address"
echo "  3. Check that the magic link email is delivered"
echo "  4. Verify the magic link works correctly"
echo ""

# Create a test script
echo "7. CREATING TEST SCRIPT..."
echo "--------------------------"

cat > test-production-email.js << 'EOF'
#!/usr/bin/env node

// Test script for production email system
const testEmail = process.argv[2] || 'test@example.com';

console.log('🧪 Testing production email system...');
console.log(`📧 Test email: ${testEmail}`);

fetch('https://testingvala.com/api/send-magic-link', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: testEmail,
    deviceId: 'test-device'
  })
})
.then(response => response.json())
.then(data => {
  console.log('📊 Response:', data);
  
  if (data.success) {
    console.log('✅ Email sent successfully!');
    console.log(`📨 Message ID: ${data.messageId}`);
  } else {
    console.log('❌ Email failed:', data.error);
    console.log(`🔍 Request ID: ${data.requestId}`);
  }
})
.catch(error => {
  console.error('❌ Test failed:', error.message);
});
EOF

chmod +x test-production-email.js
print_status "Created test script: test-production-email.js"
echo ""

# Summary
echo "8. DEPLOYMENT SUMMARY..."
echo "------------------------"

print_status "Local files updated successfully"
print_status "Diagnostic script ready"
print_status "Test script created"
echo ""

print_warning "NEXT STEPS:"
echo "1. Complete the manual steps above"
echo "2. Deploy to Vercel"
echo "3. Run: node test-production-email.js your-email@example.com"
echo ""

print_info "If you encounter issues, check:"
echo "- Supabase logs for the specific requestId"
echo "- ZeptoMail dashboard for delivery status"
echo "- Vercel function logs"
echo ""

print_status "Deployment preparation complete!"
echo "=================================="