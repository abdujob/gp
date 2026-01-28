-- Migration: Ajouter la colonne phone à la table ads
-- Date: 2026-01-28
-- Description: Déplace le champ téléphone de la table users vers la table ads

-- Ajouter la colonne phone à la table ads
ALTER TABLE ads ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Optionnel: Supprimer tous les utilisateurs existants
-- ATTENTION: Cette commande supprimera TOUS les utilisateurs et TOUTES les annonces
-- Décommentez la ligne suivante si vous souhaitez nettoyer la base de données
-- DELETE FROM users;
