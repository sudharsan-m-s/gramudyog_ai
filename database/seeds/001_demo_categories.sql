-- Demonstration category labels only. Not observed market data.
INSERT INTO categories (code, label) VALUES
  ('food_processing', 'Food processing'),
  ('tailoring', 'Tailoring'),
  ('dairy', 'Dairy'),
  ('retail', 'Small retail')
ON CONFLICT (code) DO NOTHING;
-- Synthetic prompt observations currently live in backend/app/repositories/demo.py.
-- No geographic coordinates, competitor counts, prices, or customer reach are seeded.
