-- Premium subscription and payment tables
CREATE TABLE premium_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  subscription_type TEXT DEFAULT 'monthly',
  amount DECIMAL(10,2) DEFAULT 99.00,
  status TEXT DEFAULT 'pending', -- pending, active, expired, cancelled
  payment_method TEXT DEFAULT 'upi',
  transaction_id TEXT,
  payment_screenshot_url TEXT,
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment configuration (admin managed)
CREATE TABLE payment_config (
  id BIGINT PRIMARY KEY DEFAULT 1,
  upi_id TEXT NOT NULL DEFAULT 'testingvala@paytm',
  qr_code_url TEXT,
  monthly_price DECIMAL(10,2) DEFAULT 99.00,
  currency TEXT DEFAULT 'INR',
  payment_instructions TEXT DEFAULT 'Pay ₹99 and upload screenshot for instant access',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI resume generations (track usage)
CREATE TABLE ai_resume_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  job_description TEXT NOT NULL,
  generated_resume JSONB,
  template_used TEXT DEFAULT 'professional',
  tokens_used INTEGER DEFAULT 0,
  generation_time DECIMAL(5,2),
  status TEXT DEFAULT 'completed', -- pending, completed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default payment config
INSERT INTO payment_config (id, upi_id, monthly_price) VALUES (1, 'testingvala@paytm', 99.00)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX idx_premium_subscriptions_email ON premium_subscriptions(user_email);
CREATE INDEX idx_premium_subscriptions_status ON premium_subscriptions(status);
CREATE INDEX idx_ai_resume_generations_email ON ai_resume_generations(user_email);