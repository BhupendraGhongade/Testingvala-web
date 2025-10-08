-- Premium Resume Builder Tables Setup for Supabase
-- Run these SQL commands in your Supabase SQL editor

-- 1. Premium Subscriptions Table
CREATE TABLE IF NOT EXISTS premium_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  payment_screenshot_url TEXT,
  amount DECIMAL(10,2) DEFAULT 99.00,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 month'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Payment Configuration Table
CREATE TABLE IF NOT EXISTS payment_config (
  id BIGINT PRIMARY KEY DEFAULT 1,
  monthly_price DECIMAL(10,2) DEFAULT 99.00,
  upi_id TEXT DEFAULT 'testingvala@upi',
  qr_code_url TEXT,
  payment_instructions TEXT DEFAULT 'Pay ₹99 via UPI and upload screenshot',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. AI Resume Generations Table
CREATE TABLE IF NOT EXISTS ai_resume_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  job_description TEXT NOT NULL,
  generated_resume JSONB NOT NULL,
  generation_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Storage Bucket for Payment Screenshots (Run this in Supabase Dashboard > Storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('payments', 'payments', false);

-- 5. Insert Default Payment Configuration
INSERT INTO payment_config (id, monthly_price, upi_id, payment_instructions) 
VALUES (1, 99.00, 'testingvala@upi', 'Pay ₹99 via UPI and upload payment screenshot for instant access to AI Resume Builder')
ON CONFLICT (id) DO NOTHING;

-- 6. Row Level Security (RLS) Policies

-- Premium Subscriptions RLS
ALTER TABLE premium_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions" ON premium_subscriptions
  FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can insert their own subscriptions" ON premium_subscriptions
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_email);

-- Payment Config RLS (Public read access)
ALTER TABLE payment_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read payment config" ON payment_config
  FOR SELECT USING (true);

-- AI Resume Generations RLS
ALTER TABLE ai_resume_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own generations" ON ai_resume_generations
  FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can insert their own generations" ON ai_resume_generations
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_email);

-- 7. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_user_email ON premium_subscriptions(user_email);
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_status ON premium_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_expires_at ON premium_subscriptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_resume_generations_user_email ON ai_resume_generations(user_email);
CREATE INDEX IF NOT EXISTS idx_ai_resume_generations_created_at ON ai_resume_generations(created_at);

-- 8. Functions for Subscription Management
CREATE OR REPLACE FUNCTION check_active_subscription(user_email_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM premium_subscriptions 
    WHERE user_email = user_email_param 
    AND status = 'active' 
    AND expires_at > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Function to Auto-expire Subscriptions (Run via cron or manually)
CREATE OR REPLACE FUNCTION expire_old_subscriptions()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE premium_subscriptions 
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'active' AND expires_at <= NOW();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Master Trigger to Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_premium_subscriptions_updated_at 
  BEFORE UPDATE ON premium_subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_config_updated_at 
  BEFORE UPDATE ON payment_config 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Note: Other triggers are defined in their respective setup files.