ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes TEXT[];
CREATE TABLE IF NOT EXISTS settings (id INT PRIMARY KEY, shipping_cost NUMERIC);
INSERT INTO settings (id, shipping_cost) VALUES (1, 9000) ON CONFLICT (id) DO NOTHING;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON settings FOR SELECT USING (true);
CREATE POLICY "Enable update for all users" ON settings FOR UPDATE USING (true);
CREATE POLICY "Enable insert for all users" ON settings FOR INSERT WITH CHECK (true);
