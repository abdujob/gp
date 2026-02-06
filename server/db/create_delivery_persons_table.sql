-- Create delivery_persons table
CREATE TABLE IF NOT EXISTS delivery_persons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR(100) NOT NULL,
  telephone VARCHAR(20) NOT NULL,
  ville_depart VARCHAR(100) NOT NULL,
  ville_arrivee VARCHAR(100) NOT NULL,
  prix DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_delivery_person UNIQUE(nom, telephone)
);

-- Create index for faster name searches
CREATE INDEX IF NOT EXISTS idx_delivery_persons_nom ON delivery_persons(nom);

-- Create index for phone searches
CREATE INDEX IF NOT EXISTS idx_delivery_persons_telephone ON delivery_persons(telephone);

-- Add comment
COMMENT ON TABLE delivery_persons IS 'Stores delivery person information for admin autocomplete';
