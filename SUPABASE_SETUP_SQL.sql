-- ZYCROP Supabase Real-Time Database Setup
-- Run these queries in Supabase SQL Editor
-- https://lcgyufjuznexvurvycck.supabase.co

-- ═════════════════════════════════════════════════════════════════════════════
-- TABLE 1: market_prices
-- Stores current market price data for all crops
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS market_prices (
  id BIGSERIAL PRIMARY KEY,
  crop TEXT NOT NULL UNIQUE,
  markets JSONB NOT NULL,
  best_market TEXT,
  average_price DECIMAL(10, 2),
  source TEXT DEFAULT 'agmarknet_api',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_market_prices_crop ON market_prices(crop);
CREATE INDEX IF NOT EXISTS idx_market_prices_updated ON market_prices(updated_at DESC);

-- Enable real-time for market_prices
ALTER TABLE market_prices REPLICA IDENTITY FULL;

-- ═════════════════════════════════════════════════════════════════════════════
-- TABLE 2: price_alerts
-- Stores farmer price alerts
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS price_alerts (
  id BIGSERIAL PRIMARY KEY,
  farmer_id TEXT NOT NULL,
  crop TEXT NOT NULL,
  location TEXT,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('above', 'below')),
  price_threshold DECIMAL(10, 2) NOT NULL,
  notification_methods JSONB DEFAULT '["app"]',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_alerts_farmer ON price_alerts(farmer_id);
CREATE INDEX IF NOT EXISTS idx_alerts_crop ON price_alerts(crop);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON price_alerts(active);

-- Enable real-time for price_alerts
ALTER TABLE price_alerts REPLICA IDENTITY FULL;

-- ═════════════════════════════════════════════════════════════════════════════
-- TABLE 3: price_history
-- Stores historical price data for trend analysis
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS price_history (
  id BIGSERIAL PRIMARY KEY,
  crop TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  market TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for time-series queries
CREATE INDEX IF NOT EXISTS idx_history_crop ON price_history(crop);
CREATE INDEX IF NOT EXISTS idx_history_date ON price_history(date DESC);
CREATE INDEX IF NOT EXISTS idx_history_crop_date ON price_history(crop, date DESC);

-- Enable real-time for price_history
ALTER TABLE price_history REPLICA IDENTITY FULL;

-- ═════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Allow public read/write for development
-- ═════════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- Market Prices Policies
CREATE POLICY "Allow public read on market_prices" ON market_prices
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on market_prices" ON market_prices
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on market_prices" ON market_prices
  FOR UPDATE USING (true) WITH CHECK (true);

-- Price Alerts Policies
CREATE POLICY "Allow public read on price_alerts" ON price_alerts
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on price_alerts" ON price_alerts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on price_alerts" ON price_alerts
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete on price_alerts" ON price_alerts
  FOR DELETE USING (true);

-- Price History Policies
CREATE POLICY "Allow public read on price_history" ON price_history
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on price_history" ON price_history
  FOR INSERT WITH CHECK (true);

-- ═════════════════════════════════════════════════════════════════════════════
-- SAMPLE DATA (Optional - for testing)
-- ═════════════════════════════════════════════════════════════════════════════

INSERT INTO market_prices (crop, markets, best_market, average_price, source) VALUES
('Rice', '[{"market": "Coimbatore", "price": 2100, "trend": "up", "min": 2050, "max": 2150}, {"market": "Chennai", "price": 2050, "trend": "up", "min": 2020, "max": 2080}, {"market": "Trichy", "price": 2150, "trend": "stable", "min": 2130, "max": 2180}]', 'Trichy', 2100, 'agmarknet_api') ON CONFLICT (crop) DO NOTHING;

INSERT INTO market_prices (crop, markets, best_market, average_price, source) VALUES
('Wheat', '[{"market": "Coimbatore", "price": 1850, "trend": "down", "min": 1820, "max": 1880}, {"market": "Chennai", "price": 1900, "trend": "stable", "min": 1880, "max": 1920}, {"market": "Trichy", "price": 1880, "trend": "down", "min": 1850, "max": 1910}]', 'Chennai', 1877, 'agmarknet_api') ON CONFLICT (crop) DO NOTHING;

INSERT INTO market_prices (crop, markets, best_market, average_price, source) VALUES
('Tomato', '[{"market": "Coimbatore", "price": 45, "trend": "up", "min": 40, "max": 50}, {"market": "Chennai", "price": 50, "trend": "up", "min": 48, "max": 55}, {"market": "Trichy", "price": 42, "trend": "stable", "min": 40, "max": 45}]', 'Chennai', 46, 'agmarknet_api') ON CONFLICT (crop) DO NOTHING;

-- ═════════════════════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES
-- Run these to verify setup is correct
-- ═════════════════════════════════════════════════════════════════════════════

-- Check table created successfully
-- SELECT * FROM market_prices LIMIT 1;
-- SELECT * FROM price_alerts LIMIT 1;
-- SELECT * FROM price_history LIMIT 1;

-- Check RLS is enabled
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename IN ('market_prices', 'price_alerts', 'price_history');

-- ✅ Setup Complete!
