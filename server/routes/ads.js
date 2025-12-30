const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure Multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, 'ad-' + Date.now() + path.extname(file.originalname))
    }
});
const upload = multer({ storage: storage }); // We need to create 'uploads' dir

// @route   POST api/ads
// @desc    Create an ad
// @access  Private
// note: using upload.single('image') expects a form-data field named 'image'
router.post('/', [auth, upload.single('image')], async (req, res) => {
    if (req.user.role !== 'LIVREUR_GP') {
        return res.status(403).json({ msg: 'Access denied: Only LIVREUR_GP can post ads.' });
    }
    try {
        const {
            title, description, address, city,
            latitude, longitude, available_date, transport_type,
            weight_capacity, price
        } = req.body;

        const image_url = req.file ? `/uploads/${req.file.filename}` : null;

        const newAd = await pool.query(
            `INSERT INTO ads (
                user_id, title, description, address, city, 
                latitude, longitude, available_date, transport_type, 
                image_url, weight_capacity, price
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
            RETURNING *`,
            [
                req.user.id, title, description, address, city,
                latitude, longitude, available_date, transport_type,
                image_url, weight_capacity, price
            ]
        );

        res.json(newAd.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
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
            SELECT ads.*, users.full_name as user_name, users.avatar_url ${selectDistance}
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
// @desc    Get ad by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const ad = await pool.query(
            `SELECT ads.*, users.full_name as user_name, users.avatar_url 
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
// @access  Private
router.put('/:id', [auth, upload.single('image')], async (req, res) => {
    if (req.user.role !== 'LIVREUR_GP') {
        return res.status(403).json({ msg: 'Access denied: Only LIVREUR_GP can update ads.' });
    }
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
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    if (req.user.role !== 'LIVREUR_GP') {
        return res.status(403).json({ msg: 'Access denied: Only LIVREUR_GP can delete ads.' });
    }
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

module.exports = router;
