-- Fix for stock_adjustments table schema mismatch
ALTER TABLE stock_adjustments ADD COLUMN IF NOT EXISTS adjustment_no VARCHAR(50);
ALTER TABLE stock_adjustments ADD COLUMN IF NOT EXISTS adjustment_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE stock_adjustments ADD COLUMN IF NOT EXISTS item_name VARCHAR(255);
ALTER TABLE stock_adjustments ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update existing rows with a default date if any (optional but good for data integrity)
UPDATE stock_adjustments SET adjustment_date = created_at::DATE WHERE adjustment_date IS NULL;

-- Make adjustment_date NOT NULL after providing defaults
ALTER TABLE stock_adjustments ALTER COLUMN adjustment_date SET NOT NULL;
