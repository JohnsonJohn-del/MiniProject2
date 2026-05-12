-- Ingredient price history for trend tracking and AI insights
CREATE TABLE IF NOT EXISTS ingredient_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  price_per_unit NUMERIC(12, 4) NOT NULL,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT NOT NULL DEFAULT 'manual' -- 'manual', 'import', 'seeded'
);

CREATE INDEX IF NOT EXISTS idx_price_history_user_id ON ingredient_price_history(user_id);
CREATE INDEX IF NOT EXISTS idx_price_history_ingredient_id ON ingredient_price_history(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_price_history_recorded_at ON ingredient_price_history(recorded_at DESC);
