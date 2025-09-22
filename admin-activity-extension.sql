-- Activity Tracking Extension for Existing Admin Panel
-- Optimized for Supabase Free Tier (500MB, 50k API calls/month)

-- 1. User Activity Logs (Minimal storage design)
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  module TEXT NOT NULL CHECK (module IN ('resume', 'board', 'community', 'events', 'auth')),
  action_type TEXT NOT NULL,
  resource_id TEXT, -- Generic string for flexibility
  metadata JSONB, -- Only essential data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Magic Link Tracking (Extend existing)
CREATE TABLE IF NOT EXISTS magic_link_tracking (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  device_id TEXT,
  ip_address INET,
  user_agent TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'clicked', 'verified', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE
);

-- 3. Daily Activity Summary (Aggregated for efficiency)
CREATE TABLE IF NOT EXISTS daily_activity_summary (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  module TEXT NOT NULL,
  action_type TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  UNIQUE(date, module, action_type)
);

-- Optimized Indexes (Critical for free tier performance)
CREATE INDEX IF NOT EXISTS idx_activity_user_email ON user_activity_logs(email);
CREATE INDEX IF NOT EXISTS idx_activity_module_action ON user_activity_logs(module, action_type);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON user_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_magic_link_email ON magic_link_tracking(email);
CREATE INDEX IF NOT EXISTS idx_daily_summary_date ON daily_activity_summary(date DESC);

-- RLS Policies (Admin only)
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE magic_link_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity_summary ENABLE ROW LEVEL SECURITY;

-- Admin access (adjust email as needed)
CREATE POLICY "Admin access to activity logs" ON user_activity_logs
  FOR ALL USING (auth.email() = 'admin@testingvala.com');

CREATE POLICY "Admin access to magic link tracking" ON magic_link_tracking
  FOR ALL USING (auth.email() = 'admin@testingvala.com');

CREATE POLICY "Admin access to daily summary" ON daily_activity_summary
  FOR ALL USING (auth.email() = 'admin@testingvala.com');

-- Efficient Admin Dashboard Functions
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM auth.users),
    'verified_users', (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NOT NULL),
    'users_today', (SELECT COUNT(*) FROM auth.users WHERE created_at::date = CURRENT_DATE),
    'verified_today', (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at::date = CURRENT_DATE),
    'magic_links_today', (SELECT COUNT(*) FROM magic_link_tracking WHERE created_at::date = CURRENT_DATE),
    'active_users_7d', (SELECT COUNT(DISTINCT user_id) FROM user_activity_logs WHERE created_at > NOW() - INTERVAL '7 days'),
    'total_activities', (SELECT COUNT(*) FROM user_activity_logs),
    'activities_today', (SELECT COUNT(*) FROM user_activity_logs WHERE created_at::date = CURRENT_DATE)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Module Activity Summary
CREATE OR REPLACE FUNCTION get_module_activity_summary(days_back INTEGER DEFAULT 7)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'module', module,
      'total_actions', COUNT(*),
      'unique_users', COUNT(DISTINCT user_id),
      'top_actions', (
        SELECT json_agg(
          json_build_object(
            'action', action_type,
            'count', action_count
          )
        )
        FROM (
          SELECT action_type, COUNT(*) as action_count
          FROM user_activity_logs ual2
          WHERE ual2.module = ual.module
            AND ual2.created_at > NOW() - INTERVAL '1 day' * days_back
          GROUP BY action_type
          ORDER BY action_count DESC
          LIMIT 5
        ) top_actions
      )
    )
  )
  FROM (
    SELECT module
    FROM user_activity_logs ual
    WHERE created_at > NOW() - INTERVAL '1 day' * days_back
    GROUP BY module
  ) ual
  INTO result;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Batch update daily summaries (run via cron)
CREATE OR REPLACE FUNCTION update_daily_summaries()
RETURNS VOID AS $$
BEGIN
  INSERT INTO daily_activity_summary (date, module, action_type, count, unique_users)
  SELECT 
    created_at::date,
    module,
    action_type,
    COUNT(*) as count,
    COUNT(DISTINCT user_id) as unique_users
  FROM user_activity_logs 
  WHERE created_at::date = CURRENT_DATE - INTERVAL '1 day'
  GROUP BY created_at::date, module, action_type
  ON CONFLICT (date, module, action_type) 
  DO UPDATE SET 
    count = EXCLUDED.count,
    unique_users = EXCLUDED.unique_users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_module_activity_summary(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION update_daily_summaries() TO authenticated;