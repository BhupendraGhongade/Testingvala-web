# 📧 SUPABASE LOCAL SMTP SETUP

## Option A: MailHog (Recommended for Local Testing)

### 1. Install MailHog
```bash
# macOS
brew install mailhog

# Or download from: https://github.com/mailhog/MailHog/releases
```

### 2. Start MailHog
```bash
mailhog
```
- Web UI: http://localhost:8025
- SMTP: localhost:1025

### 3. Configure Supabase Local
Add to `supabase/config.toml`:

```toml
[auth.email]
enable_signup = true
double_confirm_changes = false
enable_confirmations = false

[auth.email.smtp]
host = "localhost"
port = 1025
user = ""
pass = ""
admin_email = "admin@testingvala.com"
sender_name = "TestingVala"
```

### 4. Restart Supabase
```bash
supabase stop
supabase start
```

## Option B: Gmail SMTP (Quick Setup)

### 1. Create App Password
- Go to Google Account settings
- Enable 2FA
- Generate App Password for "Mail"

### 2. Configure Supabase
Add to `supabase/config.toml`:

```toml
[auth.email.smtp]
host = "smtp.gmail.com"
port = 587
user = "your-email@gmail.com"
pass = "your-app-password"
admin_email = "your-email@gmail.com"
sender_name = "TestingVala Dev"
```

## Option C: Ethereal Email (Zero Setup)

### 1. Get Ethereal Credentials
Visit: https://ethereal.email/create

### 2. Configure Supabase
```toml
[auth.email.smtp]
host = "smtp.ethereal.email"
port = 587
user = "generated-username"
pass = "generated-password"
admin_email = "admin@testingvala.com"
sender_name = "TestingVala"
```

### 3. View Emails
Check emails at: https://ethereal.email/messages