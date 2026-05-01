-- Kidz Story Magic - Orders Table Setup
-- Run this in Supabase SQL Editor to create the orders table

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  session_id TEXT UNIQUE NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  payment_method TEXT DEFAULT 'stripe', -- 'stripe', 'razorpay', etc.
  transaction_id TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  billing_address JSONB,
  shipping_address JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  metadata JSONB
);

-- Create indexes for faster queries
CREATE INDEX idx_orders_story_id ON orders(story_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_session_id ON orders(session_id);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Enable RLS (Row Level Security) if needed
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role access
CREATE POLICY "Allow service role full access" ON orders
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Test insert
INSERT INTO orders (story_id, user_id, session_id, amount, currency, payment_status)
VALUES (
  'test_story_1',
  'demo@example.com',
  'test_session_' || gen_random_uuid()::text,
  14.99,
  'USD',
  'completed'
);

-- Verify table
SELECT * FROM orders LIMIT 5;
