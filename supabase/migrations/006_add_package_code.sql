-- Add package_code column to custom_packages table
-- Format: #DDMMYY-HHMM-C{serial} (e.g., #020926-1700-C1)
ALTER TABLE custom_packages ADD COLUMN package_code text;

-- Create index for faster lookups by package_code
CREATE INDEX idx_custom_packages_package_code ON custom_packages(package_code) WHERE package_code IS NOT NULL;