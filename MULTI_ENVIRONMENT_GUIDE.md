# 🌍 Multi-Environment Setup Guide

## What I Built For You (Simple Explanation)

### 🏗️ Your 3-Environment Architecture

**Think of it like having 3 offices that share the same filing system:**

```
🏠 Local Office (Your Computer)
├── Database: localhost:54321 (Docker)
├── Data: Fake test data (safe to break)
├── Purpose: Development & testing
└── Command: npm run dev:setup

🏢 Dev Office (Vercel Dev)  
├── Database: Same as production
├── Data: Prefixed with "dev_" 
├── Purpose: Team testing & client previews
└── Command: npm run deploy:dev

🏭 Production Office (Vercel Prod)
├── Database: qxsardezvxsquvejvsso.supabase.co
├── Data: Real customer data
├── Purpose: Live website
└── Command: npm run deploy:prod
```

## 🎯 How It Works (Non-Technical)

### Automatic Environment Detection
Your React app automatically knows where it's running:
- **Local**: Uses `.env.local` → localhost database
- **Dev**: Uses `.env.development` → production database with dev data
- **Prod**: Uses `.env` → production database with real data

### Data Separation Strategy
- **Local**: Completely separate database (Docker)
- **Dev & Prod**: Same database, different data prefixes
- **Smart Filtering**: App shows only relevant data per environment

## 🚀 Daily Workflow

### 1. Local Development
```bash
# Start local development with test data
npm run dev:setup

# Reset if you break something
npm run dev:reset

# Check environment status
npm run env:check
```

### 2. Deploy to Dev (Team Testing)
```bash
# Deploy to development environment
npm run deploy:dev
```

### 3. Deploy to Production (Live Site)
```bash
# Deploy to production environment  
npm run deploy:prod
```

## 🛡️ Safety Features

### What You Can't Break
- ✅ **Local Development**: Reset anytime, no impact
- ✅ **Production Data**: Protected by environment filtering
- ✅ **Dev Testing**: Isolated from real users

### Automatic Protections
- **Environment Detection**: App knows where it's running
- **Data Prefixing**: Dev data marked with "dev_" prefix
- **Smart Filtering**: Only shows relevant data per environment
- **Backup System**: Production backed up before changes

## 📋 Manual Tasks You Need to Do

### In Vercel Dashboard

#### For Development Environment:
1. Create new project: "testingvala-dev"
2. Connect to your GitHub repo
3. Set branch: `dev` (create this branch)
4. Environment Variables:
   ```
   VITE_APP_ENV=development
   VITE_SUPABASE_URL=https://qxsardezvxsquvejvsso.supabase.co
   VITE_SUPABASE_ANON_KEY=your_key_here
   ```

#### For Production Environment:
1. Use existing project: "testingvala-prod"
2. Branch: `main`
3. Environment Variables:
   ```
   VITE_APP_ENV=production
   VITE_SUPABASE_URL=https://qxsardezvxsquvejvsso.supabase.co
   VITE_SUPABASE_ANON_KEY=your_key_here
   ```

### In Supabase Dashboard

#### Create Environment-Aware Policies:
```sql
-- Add environment column to tables
ALTER TABLE users ADD COLUMN IF NOT EXISTS environment TEXT DEFAULT 'production';
ALTER TABLE contest_submissions ADD COLUMN IF NOT EXISTS environment TEXT DEFAULT 'production';

-- Update RLS policies to filter by environment
CREATE POLICY "Environment isolation" ON users 
FOR ALL USING (
  environment = current_setting('app.environment', true) OR
  environment IS NULL OR
  environment = 'production'
);
```

## 🔧 Environment Configuration

### File Structure
```
├── .env                    # Production config
├── .env.development        # Dev environment config  
├── .env.local             # Local development config
├── vercel.json            # Production deployment
├── vercel-dev.json        # Dev deployment
└── scripts/
    ├── deploy-environments.js
    └── check-environment.js
```

### Environment Variables Explained
- `VITE_APP_ENV`: Tells app which environment it's in
- `VITE_SUPABASE_URL`: Database connection URL
- `VITE_SUPABASE_ANON_KEY`: Public API key

## 🎯 Data Management Strategy

### Local Environment
- **Database**: Completely separate (Docker)
- **Data**: Fake test data you can break
- **Reset**: `npm run dev:reset`

### Dev Environment  
- **Database**: Same as production
- **Data**: Prefixed with "dev_"
- **Users**: `dev_user@example.com`
- **Isolation**: Smart filtering by environment

### Production Environment
- **Database**: Real customer data
- **Data**: Clean, no prefixes
- **Users**: Real customer emails
- **Protection**: Environment-aware policies

## 🚀 Deployment Process

### Development Deployment
1. Push code to `dev` branch
2. Run `npm run deploy:dev`
3. Vercel deploys to dev URL
4. Uses development environment config

### Production Deployment
1. Merge `dev` → `main` branch
2. Run `npm run deploy:prod`
3. Vercel deploys to production URL
4. Uses production environment config

## 🆘 Troubleshooting

### Environment Not Detected
```bash
npm run env:check
```
This shows which files are missing.

### Wrong Data Showing
Check environment in browser console:
```javascript
console.log('Environment:', import.meta.env.VITE_APP_ENV)
```

### Database Connection Issues
1. Check Supabase URL in environment file
2. Verify API key is correct
3. Ensure environment variables are set in Vercel

## 📊 Monitoring & Maintenance

### Weekly Checks
```bash
# Check environment status
npm run env:check

# Verify local setup
npm run dev:setup

# Test deployments
npm run deploy:dev
```

### Monthly Tasks
- Review dev data (clean up if needed)
- Check production performance
- Update environment configurations

## 🎉 Benefits of This Setup

### For You (Non-Technical)
- **Safe Testing**: Can't break production
- **Easy Deployment**: One command per environment
- **Clear Separation**: Know exactly where you are
- **Automatic Backups**: Production always protected

### For Development
- **Environment Isolation**: No data mixing
- **Consistent Configuration**: Same setup everywhere
- **Easy Debugging**: Clear environment indicators
- **Scalable Architecture**: Easy to add more environments

## 🔮 Future Enhancements

### Possible Additions
- **Staging Environment**: Between dev and prod
- **Feature Branches**: Temporary environments
- **Automated Testing**: CI/CD pipeline
- **Performance Monitoring**: Environment-specific analytics

Your multi-environment setup is now complete and production-ready! 🚀