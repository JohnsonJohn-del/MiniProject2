-- Supabase Database Migration Updates
-- Please run this SQL in your Supabase Dashboard > SQL Editor to prepare the database.

-- 1. Add unit column to recipe_ingredients
ALTER TABLE recipe_ingredients ADD COLUMN IF NOT EXISTS unit VARCHAR(20);

-- 1b. Add water_bill column to operational_expenses
ALTER TABLE operational_expenses ADD COLUMN IF NOT EXISTS water_bill NUMERIC(12,2) NOT NULL DEFAULT 0;

-- 2. Create restaurant_profiles table
CREATE TABLE IF NOT EXISTS restaurant_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(100) NOT NULL, -- Restaurant, Cafe, Cloud Kitchen, etc.
  phone_number VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'India',
  postal_code VARCHAR(20),
  tax_id VARCHAR(100), -- GST / Tax ID
  website VARCHAR(255),
  online_platforms JSONB DEFAULT '[]'::jsonb, -- ['Swiggy', 'Zomato', ...]
  currency_code VARCHAR(10) DEFAULT 'INR',
  timezone VARCHAR(100) DEFAULT 'Asia/Kolkata',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_restaurant_profiles_user_id ON restaurant_profiles(user_id);

-- 3. Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    plan VARCHAR(50) NOT NULL DEFAULT 'free',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create payment_history table
CREATE TABLE IF NOT EXISTS public.payment_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    transaction_id VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    plan VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'success', 'failed', 'pending'
    payment_method VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
