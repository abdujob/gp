-- Ajouter les colonnes manquantes à la table users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'local',
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Mettre à jour les utilisateurs existants
UPDATE users SET provider = 'local' WHERE provider IS NULL;
UPDATE users SET email_verified = TRUE WHERE email_verified IS NULL;
