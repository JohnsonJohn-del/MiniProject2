-- 05_payments.sql
-- Create subscriptions and payment_history tables for the mock payment gateway

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    plan VARCHAR(50) NOT NULL DEFAULT 'free',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payment_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    transaction_id VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    plan VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'success', 'failed', 'pending'
    payment_method VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription" 
    ON public.subscriptions FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own payment history" 
    ON public.payment_history FOR SELECT 
    USING (auth.uid() = user_id);

-- Function to update the users table's subscription_plan when a subscription is updated
CREATE OR REPLACE FUNCTION sync_user_subscription_plan()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users 
    SET subscription_plan = NEW.plan
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER sync_user_subscription_plan_trigger
AFTER INSERT OR UPDATE OF plan, status ON public.subscriptions
FOR EACH ROW
WHEN (NEW.status = 'active')
EXECUTE FUNCTION sync_user_subscription_plan();
