-- Premium Management System Database Schema
-- Optimized for Supabase Free Tier

-- Payment Configuration Table
CREATE TABLE IF NOT EXISTS payment_config (
  id BIGINT PRIMARY KEY DEFAULT 1,
  upi_id TEXT NOT NULL,
  qr_code_url TEXT,
  monthly_price DECIMAL(10,2) DEFAULT 99.00,
  currency TEXT DEFAULT 'INR',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT
);

-- Payment Requests Table (Transaction ID only - no screenshots)
CREATE TABLE IF NOT EXISTS payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  transaction_id TEXT,
  upi_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Premium Users Table (Active premium access)
CREATE TABLE IF NOT EXISTS premium_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_email TEXT NOT NULL UNIQUE,
  user_name TEXT NOT NULL,
  start_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired')),
  approved_by TEXT DEFAULT 'admin',
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs Table (Complete transparency)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor TEXT NOT NULL, -- user123, adminX, system
  action TEXT NOT NULL, -- REQUEST_PREMIUM, APPROVE_PAYMENT, AUTO_EXPIRE
  target TEXT NOT NULL, -- payment_requests, premium_users
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default payment configuration
INSERT INTO payment_config (id, upi_id, monthly_price) 
VALUES (1, 'testingvala@paytm', 99.00)
ON CONFLICT (id) DO NOTHING;

-- Create edge function to auto-expire premium access (run daily)
-- This would be created in Supabase Edge Functions
-- SELECT cron.schedule('expire-premium-access', '0 0 * * *', 'SELECT expire_premium_access();');

-- Role validation function
CREATE OR REPLACE FUNCTION validate_qa_role(user_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN user_role ILIKE '%QA%' OR user_role ILIKE '%Test%' OR user_role ILIKE '%Quality%';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_requests_user_email ON payment_requests(user_email);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_premium_users_user_email ON premium_users(user_email);
CREATE INDEX IF NOT EXISTS idx_premium_users_expiry_date ON premium_users(expiry_date);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- RLS Policies
ALTER TABLE payment_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to payment config
CREATE POLICY "Allow public read access to payment config" ON payment_config
  FOR SELECT USING (true);

-- Allow users to read their own requests
CREATE POLICY "Users can read own requests" ON payment_requests
  FOR SELECT USING (user_email = auth.jwt() ->> 'email');

-- Allow users to create requests
CREATE POLICY "Users can create requests" ON payment_requests
  FOR INSERT WITH CHECK (user_email = auth.jwt() ->> 'email');

-- Allow users to read their own premium status
CREATE POLICY "Users can read own premium status" ON premium_users
  FOR SELECT USING (user_email = auth.jwt() ->> 'email');

-- Function to check if user has active premium
CREATE OR REPLACE FUNCTION check_premium_access(user_email_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM premium_users 
    WHERE user_email = user_email_param 
    AND expires_at > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-expire premium access
CREATE OR REPLACE FUNCTION expire_premium_access()
RETURNS void AS $$
BEGIN
  -- Update status to expired instead of deleting
  UPDATE premium_users 
  SET status = 'expired', updated_at = NOW()
  WHERE expiry_date <= CURRENT_DATE AND status = 'active';
  
  -- Log auto-expiry events
  INSERT INTO audit_logs (actor, action, target, details)
  SELECT 'system', 'AUTO_EXPIRE', 'premium_users', 
    json_build_object('user_email', user_email, 'expiry_date', expiry_date)
  FROM premium_users 
  WHERE expiry_date <= CURRENT_DATE AND status = 'expired';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log new payment requests
CREATE OR REPLACE FUNCTION log_payment_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the payment request for audit trail
  INSERT INTO audit_logs (actor, action, target, details)
  VALUES (NEW.user_email, 'REQUEST_PREMIUM', 'payment_requests', 
    json_build_object(
      'user_name', NEW.user_name, 
      'phone', NEW.user_phone, 
      'transaction_id', NEW.transaction_id,
      'upi_id', NEW.upi_id
    ));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log payment requests
CREATE TRIGGER trigger_log_payment_request
  AFTER INSERT ON payment_requests
  FOR EACH ROW
  EXECUTE FUNCTION log_payment_request();