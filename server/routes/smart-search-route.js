const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const requireLivreurGP = require('../middleware/requireLivreurGP');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const { calculateDistance, geocodeCity, daysBetween, calculateRelevanceScore } = require('../utils/geoUtils');

// ... (garder tout le code existant jusqu'à la dernière route)

/**
 * @route   GET api/ads/smart-search
 * @desc    Recherche intelligente avec fallbacks progressifs
 * @access  Public
 * 
 * Paramètres:
 * - depart: Ville de départ (string)
 * - arrivee: Ville d'arrivée (string)
 * - date: Date souhaitée (YYYY-MM-DD, optionnel)
 * - type: Type de transport (optionnel)
 * 
 * Logique de recherche en cascade:
 * 1. Recherche EXACTE (ville + date)
 * 2. Recherche PROXIMITÉ GÉOGRAPHIQUE (20km → 50km → 100km)
 * 3. Recherche PROXIMITÉ TEMPORELLE (±1j → ±3j → ±7j)
 * 4. Recherche LARGE (toutes annonces disponibles)
 */
router.get('/smart-search', async (req, res) => {
    const { depart, arrivee, date, type } = req.query;

    try {
        // Validation des paramètres
        if (!depart && !arrivee) {
            return res.status(400).json({
                msg: 'Veuillez spécifier au moins une ville de départ ou d\'arrivée'
            });
        }

        let departCoords = null;
        let arriveeCoords = null;

        // Geocoder les villes
        if (depart) {
            departCoords = await geocodeCity(depart);
            if (!departCoords) {
                return res.status(400).json({
                    msg: `Ville de départ "${depart}" introuvable`
                });
            }
        }

        if (arrivee) {
            arriveeCoords = await geocodeCity(arrivee);
            if (!arriveeCoords) {
                return res.status(400).json({
                    msg: `Ville d'arrivée "${arrivee}" introuvable`
                });
            }
        }

        // ========================================
        // ÉTAPE 1: RECHERCHE EXACTE
        // ========================================
        let exactResults = await searchExact(depart, arrivee, date, type);

        if (exactResults.length > 0) {
            // Calculer les scores même pour les résultats exacts
            const resultsWithScore = exactResults.map(ad => ({
                ...ad,
                relevance: {
                    score: 100,
                    distance_depart_km: 0,
                    distance_arrivee_km: 0,
                    date_diff_days: 0,
                    exact_match: true
                }
            }));

            return res.json({
                searchType: 'exact',
                message: null,
                results: resultsWithScore,
                total: resultsWithScore.length
            });
        }

        // ========================================
        // ÉTAPE 2: RECHERCHE PROXIMITÉ GÉOGRAPHIQUE
        // ========================================
        const radiusSteps = [20, 50, 100]; // km

        for (const radius of radiusSteps) {
            const geoResults = await searchByProximity(
                departCoords,
                arriveeCoords,
                radius,
                date,
                type
            );

            if (geoResults.length > 0) {
                // Calculer scores et trier
                const resultsWithScore = geoResults.map(ad => {
                    const distances = {
                        depart: departCoords ? calculateDistance(
                            departCoords.lat, departCoords.lng,
                            ad.latitude, ad.longitude
                        ) : null,
                        arrivee: arriveeCoords && ad.destination_lat ? calculateDistance(
                            arriveeCoords.lat, arriveeCoords.lng,
                            ad.destination_lat, ad.destination_lng
                        ) : null
                    };

                    const dateDiff = date ? daysBetween(ad.available_date, date) : 0;

                    const score = calculateRelevanceScore(ad, {
                        departCity: depart,
                        arriveeCity: arrivee,
                        date
                    }, distances);

                    return {
                        ...ad,
                        relevance: {
                            score,
                            distance_depart_km: distances.depart ? Math.round(distances.depart) : null,
                            distance_arrivee_km: distances.arrivee ? Math.round(distances.arrivee) : null,
                            date_diff_days: dateDiff,
                            exact_match: false
                        }
                    };
                }).sort((a, b) => b.relevance.score - a.relevance.score);

                return res.json({
                    searchType: 'proximity_geo',
                    message: `Aucun trajet exact trouvé. Voici des annonces dans un rayon de ${radius}km de votre recherche.`,
                    results: resultsWithScore,
                    total: resultsWithScore.length,
                    radius
                });
            }
        }

        // ========================================
        // ÉTAPE 3: RECHERCHE PROXIMITÉ TEMPORELLE
        // ========================================
        if (date) {
            const dateWindows = [1, 3, 7]; // jours

            for (const window of dateWindows) {
                const dateResults = await searchByDateProximity(
                    departCoords,
                    arriveeCoords,
                    date,
                    window,
                    type
                );

                if (dateResults.length > 0) {
                    const resultsWithScore = dateResults.map(ad => {
                        const distances = {
                            depart: departCoords ? calculateDistance(
                                departCoords.lat, departCoords.lng,
                                ad.latitude, ad.longitude
                            ) : null,
                            arrivee: arriveeCoords && ad.destination_lat ? calculateDistance(
                                arriveeCoords.lat, arriveeCoords.lng,
                                ad.destination_lat, ad.destination_lng
                            ) : null
                        };

                        const dateDiff = daysBetween(ad.available_date, date);
                        const score = calculateRelevanceScore(ad, {
                            departCity: depart,
                            arriveeCity: arrivee,
                            date
                        }, distances);

                        return {
                            ...ad,
                            relevance: {
                                score,
                                distance_depart_km: distances.depart ? Math.round(distances.depart) : null,
                                distance_arrivee_km: distances.arrivee ? Math.round(distances.arrivee) : null,
                                date_diff_days: dateDiff,
                                exact_match: false
                            }
                        };
                    }).sort((a, b) => b.relevance.score - a.relevance.score);

                    return res.json({
                        searchType: 'proximity_date',
                        message: `Aucun trajet à cette date exacte. Voici des annonces à des dates proches (±${window} jour${window > 1 ? 's' : ''}).`,
                        results: resultsWithScore,
                        total: resultsWithScore.length,
                        dateWindow: window
                    });
                }
            }
        }

        // ========================================
        // ÉTAPE 4: RECHERCHE LARGE (FALLBACK)
        // ========================================
        const fallbackResults = await searchFallback(type);

        if (fallbackResults.length > 0) {
            const resultsWithScore = fallbackResults.map(ad => {
                const distances = {
                    depart: departCoords ? calculateDistance(
                        departCoords.lat, departCoords.lng,
                        ad.latitude, ad.longitude
                    ) : null,
                    arrivee: arriveeCoords && ad.destination_lat ? calculateDistance(
                        arriveeCoords.lat, arriveeCoords.lng,
                        ad.destination_lat, ad.destination_lng
                    ) : null
                };

                const dateDiff = date ? daysBetween(ad.available_date, date) : 0;
                const score = calculateRelevanceScore(ad, {
                    departCity: depart,
                    arriveeCity: arrivee,
                    date
                }, distances);

                return {
                    ...ad,
                    relevance: {
                        score,
                        distance_depart_km: distances.depart ? Math.round(distances.depart) : null,
                        distance_arrivee_km: distances.arrivee ? Math.round(distances.arrivee) : null,
                        date_diff_days: dateDiff,
                        exact_match: false
                    }
                };
            }).sort((a, b) => b.relevance.score - a.relevance.score);

            return res.json({
                searchType: 'fallback',
                message: 'Aucun résultat exact trouvé. Voici toutes les annonces disponibles, triées par pertinence.',
                results: resultsWithScore.slice(0, 20), // Limiter à 20 résultats
                total: resultsWithScore.length
            });
        }

        // Aucun résultat du tout
        return res.json({
            searchType: 'empty',
            message: 'Aucune annonce disponible pour le moment. Créez une alerte pour être notifié !',
            results: [],
            total: 0
        });

    } catch (err) {
        console.error('Erreur smart-search:', err.message);
        res.status(500).json({ msg: 'Erreur serveur lors de la recherche' });
    }
});

// ========================================
// FONCTIONS AUXILIAIRES DE RECHERCHE
// ========================================

/**
 * Recherche exacte (ville + date)
 */
async function searchExact(depart, arrivee, date, type) {
    let conditions = [];
    let values = [];
    let paramIndex = 1;

    if (depart) {
        conditions.push(`LOWER(city) = LOWER($${paramIndex})`);
        values.push(depart);
        paramIndex++;
    }

    if (arrivee) {
        conditions.push(`LOWER(destination_city) = LOWER($${paramIndex})`);
        values.push(arrivee);
        paramIndex++;
    }

    if (date) {
        conditions.push(`available_date = $${paramIndex}`);
        values.push(date);
        paramIndex++;
    }

    if (type) {
        conditions.push(`transport_type = $${paramIndex}`);
        values.push(type);
        paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
        SELECT ads.*, users.full_name as user_name, users.avatar_url
        FROM ads
        JOIN users ON ads.user_id = users.id
        ${whereClause}
        ORDER BY ads.created_at DESC
        LIMIT 20
    `;

    const result = await pool.query(query, values);
    return result.rows;
}

/**
 * Recherche par proximité géographique
 */
async function searchByProximity(departCoords, arriveeCoords, radius, date, type) {
    // Récupérer toutes les annonces
    let conditions = [];
    let values = [];
    let paramIndex = 1;

    if (type) {
        conditions.push(`transport_type = $${paramIndex}`);
        values.push(type);
        paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
        SELECT ads.*, users.full_name as user_name, users.avatar_url
        FROM ads
        JOIN users ON ads.user_id = users.id
        ${whereClause}
        ORDER BY ads.created_at DESC
    `;

    const result = await pool.query(query, values);

    // Filtrer par distance
    const filtered = result.rows.filter(ad => {
        let matchDepart = true;
        let matchArrivee = true;

        if (departCoords) {
            const distDepart = calculateDistance(
                departCoords.lat, departCoords.lng,
                ad.latitude, ad.longitude
            );
            matchDepart = distDepart <= radius;
        }

        if (arriveeCoords && ad.destination_lat) {
            const distArrivee = calculateDistance(
                arriveeCoords.lat, arriveeCoords.lng,
                ad.destination_lat, ad.destination_lng
            );
            matchArrivee = distArrivee <= radius;
        }

        return matchDepart && matchArrivee;
    });

    return filtered;
}

/**
 * Recherche par proximité temporelle
 */
async function searchByDateProximity(departCoords, arriveeCoords, targetDate, windowDays, type) {
    const targetDateObj = new Date(targetDate);
    const minDate = new Date(targetDateObj);
    minDate.setDate(minDate.getDate() - windowDays);
    const maxDate = new Date(targetDateObj);
    maxDate.setDate(maxDate.getDate() + windowDays);

    let conditions = [`available_date BETWEEN $1 AND $2`];
    let values = [minDate.toISOString().split('T')[0], maxDate.toISOString().split('T')[0]];
    let paramIndex = 3;

    if (type) {
        conditions.push(`transport_type = $${paramIndex}`);
        values.push(type);
        paramIndex++;
    }

    const query = `
        SELECT ads.*, users.full_name as user_name, users.avatar_url
        FROM ads
        JOIN users ON ads.user_id = users.id
        WHERE ${conditions.join(' AND ')}
        ORDER BY ABS(EXTRACT(EPOCH FROM (available_date - $${paramIndex}::date))) ASC
        LIMIT 20
    `;

    values.push(targetDate);

    const result = await pool.query(query, values);
    return result.rows;
}

/**
 * Recherche large (fallback)
 */
async function searchFallback(type) {
    let conditions = [];
    let values = [];

    if (type) {
        conditions.push(`transport_type = $1`);
        values.push(type);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
        SELECT ads.*, users.full_name as user_name, users.avatar_url
        FROM ads
        JOIN users ON ads.user_id = users.id
        ${whereClause}
        ORDER BY ads.created_at DESC
        LIMIT 50
    `;

    const result = await pool.query(query, values);
    return result.rows;
}

module.exports = router;
