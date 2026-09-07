-- Add deal_code column to tour_deals table
-- Format: #DDMMYY-HHMM (e.g., #020926-1700)
ALTER TABLE tour_deals ADD COLUMN deal_code text;

-- Create index for faster lookups by deal_code
CREATE INDEX idx_tour_deals_deal_code ON tour_deals(deal_code) WHERE deal_code IS NOT NULL;