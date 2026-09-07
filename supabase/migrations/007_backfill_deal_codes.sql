-- Backfill deal_code for existing tour_deals that were created before migration 005
-- Format: #DDMMYY-HHMM using the deal's created_at timestamp

UPDATE tour_deals
SET deal_code = CONCAT(
  '#',
  LPAD(EXTRACT(DAY FROM created_at)::text, 2, '0'),
  LPAD(EXTRACT(MONTH FROM created_at)::text, 2, '0'),
  LPAD(SUBSTRING(EXTRACT(YEAR FROM created_at)::text, 3, 2), 2, '0'),
  '-',
  LPAD(EXTRACT(HOUR FROM created_at)::text, 2, '0'),
  LPAD(EXTRACT(MINUTE FROM created_at)::text, 2, '0')
)
WHERE deal_code IS NULL;

-- Now make deal_code NOT NULL since every deal must have one
ALTER TABLE tour_deals ALTER COLUMN deal_code SET NOT NULL;
