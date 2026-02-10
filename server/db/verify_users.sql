-- Vérifier les utilisateurs existants
SELECT id, full_name, email, role, provider, email_verified, created_at 
FROM users 
ORDER BY created_at DESC;

-- Vérifier si les colonnes existent
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
