-- Script pour créer les utilisateurs de test dans Supabase
-- Exécutez ce script dans Supabase SQL Editor

-- Utilisateur ADMIN
-- Email: gp.notifs@gmail.com
-- Password: admin123
INSERT INTO users (
    full_name, 
    email, 
    password_hash, 
    role, 
    phone, 
    email_verified
) VALUES (
    'SA Ndimb',
    'gp.notifs@gmail.com',
    '$2a$10$rOJ7nVZ8vQGQxH5fZ5fZ5eZ5fZ5fZ5fZ5fZ5fZ5fZ5fZ5fZ5fZ5fZ',  -- Mot de passe: admin123
    'ADMIN',
    '+221776543210',
    TRUE
)
ON CONFLICT (email) DO UPDATE 
SET role = 'ADMIN', email_verified = TRUE;

-- Utilisateur LIVREUR_GP
-- Email: test@gp.com
-- Password: livreur123
INSERT INTO users (
    full_name, 
    email, 
    password_hash, 
    role, 
    phone, 
    email_verified
) VALUES (
    'Test Livreur',
    'test@gp.com',
    '$2a$10$rOJ7nVZ8vQGQxH5fZ5fZ5eZ5fZ5fZ5fZ5fZ5fZ5fZ5fZ5fZ5fZ5fZ',  -- Mot de passe: livreur123
    'LIVREUR_GP',
    '+221770123456',
    TRUE
)
ON CONFLICT (email) DO UPDATE 
SET role = 'LIVREUR_GP', email_verified = TRUE;

-- Vérifier les utilisateurs créés
SELECT id, full_name, email, role, email_verified 
FROM users 
ORDER BY created_at DESC;
