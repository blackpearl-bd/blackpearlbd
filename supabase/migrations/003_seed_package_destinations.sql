-- Ensure package_destinations seed data exists (idempotent)
INSERT INTO package_destinations (category, name, value, sort_order) VALUES
  ('Bangladesh', 'Bangladesh (Customized)', 'bangladesh-customized', 0),
  ('Bangladesh', 'Dhaka Division', 'dhaka-division', 1),
  ('Bangladesh', 'Chattogram Division', 'chattogram-division', 2),
  ('Bangladesh', 'Sylhet Division', 'sylhet-division', 3),
  ('Bangladesh', 'Rajshahi Division', 'rajshahi-division', 4),
  ('Bangladesh', 'Khulna Division', 'khulna-division', 5),
  ('Bangladesh', 'Barishal Division', 'barishal-division', 6),
  ('Bangladesh', 'Rangpur Division', 'rangpur-division', 7),
  ('Bangladesh', 'Mymensingh Division', 'mymensingh-division', 8),
  ('Asia', 'Thailand', 'thailand', 0),
  ('Asia', 'Malaysia', 'malaysia', 1),
  ('Asia', 'Indonesia', 'indonesia', 2),
  ('Asia', 'United Arab Emirates', 'united-arab-emirates', 3),
  ('Asia', 'Maldives', 'maldives', 4),
  ('Asia', 'Nepal', 'nepal', 5),
  ('Asia', 'Japan', 'japan', 6),
  ('Asia / Europe', 'Turkey', 'turkey', 0),
  ('Europe', 'Switzerland', 'switzerland', 0),
  ('Europe', 'France', 'france', 1)
ON CONFLICT (value) DO NOTHING;
