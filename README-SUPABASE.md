# 🚀 Supabase Automation Guide

## Quick Start (For Non-Technical Users)

### 1. Initial Setup
```bash
npm run setup
```
This will:
- Install Supabase CLI
- Initialize your project
- Create admin/user table separation
- Set up safety checks

### 2. Daily Development Workflow

#### Test Changes Locally
```bash
npm run db:migrate
```
- Tests all changes on your computer first
- Never touches production
- Safe to experiment

#### Deploy to Production (When Ready)
```bash
npm run db:deploy
```
- Creates automatic backup
- Applies changes to live site
- Verifies everything works

### 3. Emergency Commands

#### Backup Production
```bash
npm run db:backup
```

#### Reset Local Database
```bash
npm run db:reset
```

## 🛡️ Safety Features

### Admin/User Separation
- **Admin tables**: `admin.admin_sessions`, `admin.payment_config`
- **User tables**: `public.users`, `public.contest_submissions`
- **Automatic**: New tables follow naming convention

### Migration Safety
1. **Local First**: All changes tested locally
2. **Auto Backup**: Production backed up before changes
3. **Rollback Ready**: Can undo if something breaks
4. **Verification**: Checks everything works after deployment

### What You Can't Break
- ✅ Local development (reset anytime)
- ✅ Production data (auto-backed up)
- ✅ User access (RLS policies protect data)

### What's Protected
- 🔒 Production database (requires backup first)
- 🔒 User data (only users can see their own)
- 🔒 Admin data (only admins can access)

## 📋 Common Tasks

### Adding New Tables
1. Create migration file in `supabase/migrations/`
2. Run `npm run db:migrate` to test
3. Run `npm run db:deploy` when ready

### Modifying Existing Tables
1. Use `npm run db:diff` to generate migration
2. Test with `npm run db:migrate`
3. Deploy with `npm run db:deploy`

### Checking Status
```bash
npm run db:status
```

## 🆘 Troubleshooting

### Migration Failed Locally
- Fix the SQL in migration file
- Run `npm run db:reset` to start fresh
- Try `npm run db:migrate` again

### Production Deployment Failed
- Check backup in `backups/` folder
- Contact support with error message
- Don't panic - data is safe

### Need to Rollback
- Restore from backup in `backups/` folder
- Use Supabase dashboard to restore
- Contact support if needed

## 📁 File Structure
```
supabase/
├── config.toml          # Supabase settings
├── migrations/          # Database changes
└── seed.sql            # Test data (local only)

scripts/
├── safe-migrate.js     # Test locally first
├── deploy-prod.js      # Deploy to production
└── backup-prod.js      # Backup production

backups/                # Automatic backups
└── [timestamp]/        # Each backup folder
```

## 🎯 Best Practices

1. **Always test locally first**
2. **Use descriptive migration names**
3. **Backup before major changes**
4. **Keep admin/user tables separate**
5. **Never edit production directly**