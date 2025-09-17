# URGENT: Run These SQL Commands in Supabase Dashboard

## Go to your Supabase Dashboard → SQL Editor and run these commands:

```sql
-- Add missing columns to upcoming_events table
ALTER TABLE upcoming_events 
ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS speaker TEXT DEFAULT 'QA Expert',
ADD COLUMN IF NOT EXISTS speaker_title TEXT DEFAULT 'Senior QA Professional',
ADD COLUMN IF NOT EXISTS company TEXT DEFAULT 'TestingVala',
ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Online',
ADD COLUMN IF NOT EXISTS price TEXT DEFAULT '$99',
ADD COLUMN IF NOT EXISTS registered_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
```

## After running the above, run this to update any existing records:

```sql
UPDATE upcoming_events 
SET 
  capacity = COALESCE(capacity, 50),
  speaker = COALESCE(speaker, 'QA Expert'),
  speaker_title = COALESCE(speaker_title, 'Senior QA Professional'),
  company = COALESCE(company, 'TestingVala'),
  location = COALESCE(location, 'Online'),
  price = COALESCE(price, '$99'),
  registered_count = COALESCE(registered_count, 0),
  featured = COALESCE(featured, false)
WHERE id IS NOT NULL;
```

## Steps:
1. Go to https://supabase.com/dashboard
2. Select your project: qxsardezvxsquvejvsso
3. Go to SQL Editor (left sidebar)
4. Paste and run the first SQL block
5. Paste and run the second SQL block
6. Try creating an event again in your admin panel

This will add all the missing columns that your code is trying to use.