#!/bin/bash

# Production Email Fix Deployment Script
echo "🚀 Deploying Production Email Fix..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Backup current environment
echo "📦 Creating backup..."
cp .env.production .env.production.backup.$(date +%Y%m%d_%H%M%S)

# Verify environment variables
echo "🔍 Verifying environment variables..."

# Check if ZeptoMail API key is set
if grep -q "your_production_zepto_key" .env.production; then
    echo "⚠️  WARNING: ZeptoMail API key still contains placeholder"
    echo "Please update ZEPTO_API_KEY in .env.production with your actual key"
fi

# Check if Supabase URL is set
if grep -q "your_production_supabase_url" .env.production; then
    echo "⚠️  WARNING: Supabase URL still contains placeholder"
    echo "Please update VITE_SUPABASE_URL in .env.production"
fi

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel (if vercel CLI is available)
if command -v vercel &> /dev/null; then
    echo "🚀 Deploying to Vercel..."
    
    # Set environment variables in Vercel
    echo "📝 Setting Vercel environment variables..."
    
    # Read from .env.production and set in Vercel
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        if [[ $key =~ ^[[:space:]]*# ]] || [[ -z $key ]]; then
            continue
        fi
        
        # Remove any quotes from value
        value=$(echo "$value" | sed 's/^"//;s/"$//')
        
        # Set in Vercel for production
        if [[ ! -z $value && $value != *"your_"* ]]; then
            echo "Setting $key in Vercel..."
            vercel env add "$key" production <<< "$value"
        fi
    done < .env.production
    
    # Deploy
    vercel --prod
    
    if [ $? -eq 0 ]; then
        echo "🎉 Deployment successful!"
        echo ""
        echo "📋 Next Steps:"
        echo "1. Test magic link functionality on your production site"
        echo "2. Check Vercel function logs if issues persist"
        echo "3. Verify ZeptoMail domain settings if emails aren't delivered"
        echo ""
        echo "🔗 Useful links:"
        echo "- Vercel Dashboard: https://vercel.com/dashboard"
        echo "- ZeptoMail Dashboard: https://www.zoho.com/zeptomail/"
        echo "- Supabase Dashboard: https://supabase.com/dashboard"
    else
        echo "❌ Deployment failed. Check Vercel logs for details."
        exit 1
    fi
else
    echo "⚠️  Vercel CLI not found. Please deploy manually:"
    echo "1. Push changes to your Git repository"
    echo "2. Vercel will auto-deploy from Git"
    echo "3. Or install Vercel CLI: npm i -g vercel"
fi

echo ""
echo "🔧 Manual Environment Variable Setup (if needed):"
echo "Go to Vercel Dashboard > Project > Settings > Environment Variables"
echo "Add these variables for Production:"
echo "- ZEPTO_API_KEY: Your ZeptoMail API key"
echo "- ZEPTO_FROM_EMAIL: info@testingvala.com"
echo "- ZEPTO_FROM_NAME: TestingVala"
echo "- VITE_SUPABASE_URL: Your Supabase project URL"
echo "- VITE_SUPABASE_ANON_KEY: Your Supabase anon key"

echo ""
echo "✅ Production email fix deployment complete!"