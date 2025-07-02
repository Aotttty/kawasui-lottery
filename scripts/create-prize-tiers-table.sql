-- Create prize_tiers table for lottery inventory management
CREATE TABLE IF NOT EXISTS prize_tiers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  inventory INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial prize tier data
INSERT INTO prize_tiers (id, name, inventory) VALUES
  ('special', '特賞', 2),
  ('first', '1等', 3),
  ('second', '2等', 10),
  ('third', '3等', 15),
  ('fourth', '4等', 25),
  ('fifth', '5等', 200),
  ('participation', '参加賞', 300)
ON CONFLICT (id) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_prize_tiers_updated_at ON prize_tiers;
CREATE TRIGGER update_prize_tiers_updated_at
    BEFORE UPDATE ON prize_tiers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
