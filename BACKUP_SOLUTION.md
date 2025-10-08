# 🔧 Backup Solution for TestingVala

## ❌ Current Issue
The backup is failing because:
1. **Project not linked properly** - CLI can't find production project reference
2. **Database password required** - Production database needs authentication
3. **Invalid API keys** - Anon keys are not working for data access

## ✅ Solutions Available

### Option 1: CLI Backup (Recommended)
```bash
# 1. Login to Supabase (if not already logged in)
supabase login

# 2. Link to your production project
supabase link --project-ref qxsardezvxsquvejvsso

# 3. Set database password (get from Supabase dashboard)
# Go to: https://supabase.com/dashboard/project/qxsardezvxsquvejvsso/settings/database
# Copy the database password

# 4. Run backup with password
supabase db dump --linked --password YOUR_DB_PASSWORD > backup.sql
```

### Option 2: API Backup (Service Key Required)
```bash
# 1. Get service key from Supabase dashboard
# Go to: https://supabase.com/dashboard/project/qxsardezvxsquvejvsso/settings/api
# Copy the "service_role" key (NOT the anon key)

# 2. Set environment variable
export SUPABASE_SERVICE_KEY="your_service_key_here"

# 3. Run API backup
npm run db:backup-api
```

### Option 3: Manual Export (Dashboard)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/qxsardezvxsquvejvsso)
2. Navigate to **Table Editor**
3. For each table, click **Export** → **CSV** or **JSON**
4. Download all table data manually

## 🚀 Quick Fix Commands

### Get Database Password
```bash
# Open Supabase dashboard
open "https://supabase.com/dashboard/project/qxsardezvxsquvejvsso/settings/database"
```

### Get Service Key
```bash
# Open API settings
open "https://supabase.com/dashboard/project/qxsardezvxsquvejvsso/settings/api"
```

### Test Connection
```bash
# Test if project is accessible
supabase projects list
```

## 📋 Available Backup Commands

| Command | Description | Requirements |
|---------|-------------|--------------|
| `npm run db:backup` | CLI backup (needs password) | Database password |
| `npm run db:backup-api` | API backup (needs service key) | Service key |
| `npm run db:backup-quick` | Quick public data backup | None (limited data) |
| `npm run db:backup-working` | Working backup script | Valid credentials |

## 🔑 Required Credentials

### For CLI Backup:
- **Database Password**: From Supabase Dashboard → Settings → Database
- **Project linked**: `supabase link --project-ref qxsardezvxsquvejvsso`

### For API Backup:
- **Service Key**: From Supabase Dashboard → Settings → API → service_role key
- **Environment Variable**: `SUPABASE_SERVICE_KEY=your_key`

## 🎯 Recommended Steps

1. **Get your database password** from Supabase dashboard
2. **Link the project** if not already linked
3. **Run CLI backup** with password
4. **Verify backup file** is created successfully

## 📞 Need Help?

If you need the actual credentials:
1. Login to your Supabase account
2. Go to project settings
3. Copy the required keys/passwords
4. Run the backup commands above

The backup will create a complete SQL dump of your production database that can be used for:
- **Data recovery**
- **Migration to new environment**
- **Development database seeding**
- **Compliance and auditing**