const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const requireLivreurGP = require('../middleware/requireLivreurGP');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const { calculateDistance, geocodeCity, daysBetween, calculateRelevanceScore } = require('../utils/geoUtils');

// Configure Multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, 'ad-' + Date.now() + path.extname(file.originalname))
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Seules les images (JPEG, PNG, WEBP) sont autorisÃ©es'));
    }
});

// @route   POST api/ads
// @desc    Create an ad
// @access  Private (LIVREUR_GP only)
router.post('/', [
    auth,
    requireLivreurGP,
    upload.single('image'),
    // Validation rules
    body('departure_city').trim().notEmpty().withMessage('La ville de départ est requise'),
    body('arrival_city').trim().notEmpty().withMessage('La ville d\'arrivée est requise'),
    body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('La description doit contenir entre 10 et 1000 caractères'),
    body('address').trim().notEmpty().withMessage('L\'adresse est requise'),
    body('city').trim().notEmpty().withMessage('La ville est requise'),
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitude invalide'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitude invalide'),
    body('available_date').isISO8601().withMessage('Date invalide'),
    body('transport_types').isArray({ min: 1 }).withMessage('Sélectionnez au moins un type de colis'),
    body('price').isFloat({ min: 0 }).withMessage('Le prix doit être positif'),
    body('phone').trim().notEmpty().withMessage('Le numéro de téléphone est requis')
        .matches(/^[\d\s\-\+\(\)]+$/)
        .withMessage('Numéro de téléphone invalide')
        .isLength({ min: 8, max: 20 })
        .withMessage('Le numéro de téléphone doit contenir entre 8 et 20 caractères'),
    body('advertiser_name').optional().trim().isLength({ min: 2, max: 255 }).withMessage('Le nom doit contenir entre 2 et 255 caractères')
], async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const {
            departure_city, arrival_city, description, address, city,
            latitude, longitude, available_date, transport_types,
            price, phone, advertiser_name
        } = req.body;

        // Générer le titre automatiquement
        const title = `${departure_city} → ${arrival_city}`;

        // Convertir transport_types en JSON
        const transport_type_json = JSON.stringify(transport_types);

        // Vérifier si l'utilisateur est admin pour advertiser_name
        // Note: Pour l'instant, LIVREUR_GP est utilisé comme rôle admin temporaire
        // Quand le frontend sera redéployé avec le rôle ADMIN, on changera cette vérification
        const finalAdvertiserName = advertiser_name || null;

        const image_url = req.file ? `/uploads/${req.file.filename}` : null;

        const newAd = await pool.query(
            `INSERT INTO ads (
                user_id, title, description, address, city, 
                latitude, longitude, available_date, transport_type, 
                image_url, price, phone, advertiser_name,
                departure_city, arrival_city
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
            RETURNING *`,
            [
                req.user.id, title, description || null, address, city,
                latitude, longitude, available_date, transport_type_json,
                image_url, price, phone, finalAdvertiserName,
                departure_city, arrival_city
            ]
        );

        res.json(newAd.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erreur serveur lors de la création de l\'annonce' });
    }
});

// @route   GET api/ads
// @desc    Get all ads (with optional geospatial search)
// @access  Public
// @route   GET api/ads
// @desc    Get all ads (with optional geospatial search, pagination, filtering)
// @access  Public
router.get('/', async (req, res) => {
    const { lat, lng, radius, type, date, limit = 10, page = 1 } = req.query;

    try {
        let conditions = [];
        let values = [];
        let selectDistance = "";
        let orderBy = "available_date ASC"; // Default sort: closest date

        // Pagination
        const limitVal = parseInt(limit);
        const pageVal = parseInt(page);
        const offset = (pageVal - 1) * limitVal;

        // 1. Hide Expired Ads (default rule)
        // PostgreSQL: available_date >= CURRENT_DATE
        // We push this as the first condition.
        conditions.push(`available_date >= CURRENT_DATE`);

        // 2. Geospatial Filter
        if (lat && lng) {
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);

            // Push values for distance calc
            // indices will be dynamic based on values.length + 1
            // We'll manage indices by pushing to values array immediately

            // To sanitize distance calc params, we need to know their $index.
            // But we have a dynamic list.
            // Let's create a builder helper or just track index carefully.

            // Current values empty.
            // values index 1 = userLat
            // values index 2 = userLng

            values.push(userLat);
            values.push(userLng);

            // Distance Calculation Formula (Haversine)
            // 6371 * acos( ... )
            // We use the values directly in the string via $1, $2
            selectDistance = `, (6371 * acos(
                cos(radians($1)) * 
                cos(radians(latitude)) * 
                cos(radians(longitude) - radians($2)) + 
                sin(radians($1)) * 
                sin(radians(latitude))
            )) AS distance`;

            // Filter Radius
            if (radius) {
                const r = parseFloat(radius);
                values.push(r); // index 3
                conditions.push(`(6371 * acos(
                    cos(radians($1)) * 
                    cos(radians(latitude)) * 
                    cos(radians(longitude) - radians($2)) + 
                    sin(radians($1)) * 
                    sin(radians(latitude))
                )) < $${values.length}`);
            }

            orderBy = "distance ASC";
        }

        // 3. Type Filter
        if (type) {
            values.push(type);
            conditions.push(`transport_type = $${values.length}`);
        }

        // 4. Date Filter logic
        // date param can be 'today', 'week', or a specific date YYYY-MM-DD
        if (date) {
            if (date === 'today') {
                conditions.push(`available_date = CURRENT_DATE`);
            } else if (date === 'week') {
                conditions.push(`available_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 7`);
            } else {
                // Specific date (on or after)
                values.push(date);
                conditions.push(`available_date >= $${values.length}`);
            }
        }

        let whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

        // Count for pagination
        const countQuery = `
            SELECT COUNT(*) 
            FROM ads 
            ${whereClause}
        `;
        // For count query, we need strictly the values used in WHERE.
        // The distance logic uses $1, $2 which might be in WHERE if radius is checked.
        // It's safe to reuse 'values' array because it contains all params needed.

        const countResult = await pool.query(countQuery, values);
        const totalItems = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalItems / limitVal);

        // Main Query
        values.push(limitVal); // Limit
        values.push(offset); // Offset

        const text = `
            SELECT ads.*, users.full_name as user_name, users.avatar_url, users.phone as user_phone ${selectDistance}
            FROM ads 
            JOIN users ON ads.user_id = users.id 
            ${whereClause}
            ORDER BY ${orderBy}
            LIMIT $${values.length - 1} OFFSET $${values.length}
        `;

        const result = await pool.query(text, values);

        res.json({
            data: result.rows,
            pagination: {
                total: totalItems,
                page: pageVal,
                pages: totalPages,
                limit: limitVal
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/ads/my
// @desc    Get current user's ads
// @access  Private
router.get('/my', auth, async (req, res) => {
    try {
        const ads = await pool.query(
            'SELECT * FROM ads WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(ads.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/ads/:id

router.get('/smart-search', async (req, res) => {
    const { depart, arrivee, date, type } = req.query;

    try {
        // Validation des paramÃ¨tres
        if (!depart && !arrivee) {
            return res.status(400).json({
                msg: 'Veuillez spÃ©cifier au moins une ville de dÃ©part ou d\'arrivÃ©e'
            });
        }

        let departCoords = null;
        let arriveeCoords = null;

        // Geocoder les villes
        if (depart) {
            departCoords = await geocodeCity(depart);
            if (!departCoords) {
                return res.status(400).json({
                    msg: `Ville de dÃ©part "${depart}" introuvable`
                });
            }
        }

        if (arrivee) {
            arriveeCoords = await geocodeCity(arrivee);
            if (!arriveeCoords) {
                return res.status(400).json({
                    msg: `Ville d'arrivÃ©e "${arrivee}" introuvable`
                });
            }
        }

        // ========================================
        // Ã‰TAPE 1: RECHERCHE EXACTE
        // ========================================
        let exactResults = await searchExact(depart, arrivee, date, type);

        if (exactResults.length > 0) {
            // Calculer les scores mÃªme pour les rÃ©sultats exacts
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
        // Ã‰TAPE 2: RECHERCHE PROXIMITÃ‰ GÃ‰OGRAPHIQUE
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
                    message: `Aucun trajet exact trouvÃ©. Voici des annonces dans un rayon de ${radius}km de votre recherche.`,
                    results: resultsWithScore,
                    total: resultsWithScore.length,
                    radius
                });
            }
        }

        // ========================================
        // Ã‰TAPE 3: RECHERCHE PROXIMITÃ‰ TEMPORELLE
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
                        message: `Aucun trajet Ã  cette date exacte. Voici des annonces Ã  des dates proches (Â±${window} jour${window > 1 ? 's' : ''}).`,
                        results: resultsWithScore,
                        total: resultsWithScore.length,
                        dateWindow: window
                    });
                }
            }
        }

        // ========================================
        // Ã‰TAPE 4: RECHERCHE LARGE (FALLBACK)
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
                message: 'Aucun resultat exact trouve. Voici toutes les annonces disponibles, triees par pertinence.',
                results: resultsWithScore.slice(0, 20), // Limiter Ã  20 rÃ©sultats
                total: resultsWithScore.length
            });
        }

        // Aucun rÃ©sultat du tout
        return res.json({
            searchType: 'empty',
            message: 'Aucune annonce disponible pour le moment. Creez une alerte pour etre notifie !',
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
        conditions.push(`LOWER(city) = LOWER(${paramIndex})`);
        values.push(depart);
        paramIndex++;
    }

    if (arrivee) {
        conditions.push(`LOWER(destination_city) = LOWER(${paramIndex})`);
        values.push(arrivee);
        paramIndex++;
    }

    if (date) {
        conditions.push(`available_date = ${paramIndex}`);
        values.push(date);
        paramIndex++;
    }

    if (type) {
        conditions.push(`transport_type = ${paramIndex}`);
        values.push(type);
        paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
        SELECT ads.*, users.full_name as user_name, users.avatar_url, users.phone as user_phone
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
 * Recherche par proximitÃ© gÃ©ographique
 */
async function searchByProximity(departCoords, arriveeCoords, radius, date, type) {
    // RÃ©cupÃ©rer toutes les annonces
    let conditions = [];
    let values = [];
    let paramIndex = 1;

    if (type) {
        conditions.push(`transport_type = ${paramIndex}`);
        values.push(type);
        paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
        SELECT ads.*, users.full_name as user_name, users.avatar_url, users.phone as user_phone
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
 * Recherche par proximitÃ© temporelle
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
        conditions.push(`transport_type = ${paramIndex}`);
        values.push(type);
        paramIndex++;
    }

    const query = `
        SELECT ads.*, users.full_name as user_name, users.avatar_url, users.phone as user_phone
        FROM ads
        JOIN users ON ads.user_id = users.id
        WHERE ${conditions.join(' AND ')}
        ORDER BY ABS(EXTRACT(EPOCH FROM (available_date - ${paramIndex}::date))) ASC
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
        SELECT ads.*, users.full_name as user_name, users.avatar_url, users.phone as user_phone
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

module.exports = router;


// @desc    Get ad by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const ad = await pool.query(
            `SELECT ads.*, users.full_name as user_name, users.avatar_url, users.phone as user_phone 
             FROM ads 
             JOIN users ON ads.user_id = users.id 
             WHERE ads.id = $1`,
            [req.params.id]
        );

        if (ad.rows.length === 0) {
            return res.status(404).json({ msg: 'Ad not found' });
        }

        res.json(ad.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/ads/:id
// @desc    Update ad
// @access  Private (LIVREUR_GP only)
router.put('/:id', [auth, requireLivreurGP, upload.single('image')], async (req, res) => {
    try {
        const {
            title, description, address, city,
            latitude, longitude, available_date, transport_type,
            weight_capacity, price
        } = req.body;

        // Check ownership
        const adCheck = await pool.query('SELECT user_id FROM ads WHERE id = $1', [req.params.id]);
        if (adCheck.rows.length === 0) {
            return res.status(404).json({ msg: 'Ad not found' });
        }
        if (adCheck.rows[0].user_id !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        const image_url = req.file ? `/uploads/${req.file.filename}` : undefined;

        let updateQuery = `
            UPDATE ads SET 
                title = COALESCE($1, title),
                description = COALESCE($2, description),
                address = COALESCE($3, address),
                city = COALESCE($4, city),
                latitude = COALESCE($5, latitude),
                longitude = COALESCE($6, longitude),
                available_date = COALESCE($7, available_date),
                transport_type = COALESCE($8, transport_type),
                weight_capacity = COALESCE($9, weight_capacity),
                price = COALESCE($10, price)
        `;

        const queryParams = [
            title, description, address, city,
            latitude, longitude, available_date, transport_type,
            weight_capacity, price
        ];

        let paramIndex = 11;
        if (image_url) {
            updateQuery += `, image_url = $${paramIndex}`;
            queryParams.push(image_url);
            paramIndex++;
        }

        updateQuery += ` WHERE id = $${paramIndex} RETURNING *`;
        queryParams.push(req.params.id);

        const updatedAd = await pool.query(updateQuery, queryParams);
        res.json(updatedAd.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/ads/:id
// @desc    Delete ad
// @access  Private (LIVREUR_GP only)
router.delete('/:id', [auth, requireLivreurGP], async (req, res) => {
    try {
        const ad = await pool.query('SELECT * FROM ads WHERE id = $1', [req.params.id]);

        if (ad.rows.length === 0) {
            return res.status(404).json({ msg: 'Ad not found' });
        }

        // Check user
        if (ad.rows[0].user_id !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await pool.query('DELETE FROM ads WHERE id = $1', [req.params.id]);
        res.json({ msg: 'Ad removed' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   GET api/ads/smart-search
 * @desc    Recherche intelligente avec fallbacks progressifs
 * @access  Public
 * 
 * ParamÃ¨tres:
 * - depart: Ville de dÃ©part (string)
 * - arrivee: Ville d'arrivÃ©e (string)
 * - date: Date souhaitÃ©e (YYYY-MM-DD, optionnel)
 * - type: Type de transport (optionnel)
 * 
 * Logique de recherche en cascade:
 * 1. Recherche EXACTE (ville + date)
 * 2. Recherche PROXIMITÃ‰ GÃ‰OGRAPHIQUE (20km â†’ 50km â†’ 100km)
 * 3. Recherche PROXIMITÃ‰ TEMPORELLE (Â±1j â†’ Â±3j â†’ Â±7j)
 * 4. Recherche LARGE (toutes annonces disponibles)
 */

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
        SELECT ads.*, users.full_name as user_name, users.avatar_url, users.phone as user_phone
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
        SELECT ads.*, users.full_name as user_name, users.avatar_url, users.phone as user_phone
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
        SELECT ads.*, users.full_name as user_name, users.avatar_url, users.phone as user_phone
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
        SELECT ads.*, users.full_name as user_name, users.avatar_url, users.phone as user_phone
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