ALTER TABLE products ADD COLUMN IF NOT EXISTS additional_images TEXT[] DEFAULT '{}';
