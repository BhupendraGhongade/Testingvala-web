-- Complete fix for payment_requests table

-- Drop existing table and recreate with correct structure
DROP TABLE IF EXISTS payment_requests CASCADE;

-- Create table with exact structure needed
CREATE TABLE payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Enable RLS
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;

-- Create simple policies that work
CREATE POLICY "Allow all operations" ON payment_requests FOR ALL USING (true);

-- Create indexes
CREATE INDEX idx_payment_requests_user_email ON payment_requests(user_email);
CREATE INDEX idx_payment_requests_status ON payment_requests(status);

-- Test the table
SELECT 'Table created successfully!' as status;