const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for Render deployment
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"]
        }
    }
}));

// CORS Configuration
const corsOptions = {
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Route
app.get('/', (req, res) => {
    res.json({
        status: 'running',
        message: 'GP API Server',
        version: '2.0.0',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/test-db', async (req, res) => {
    try {
        const pool = require('./db');
        const start = Date.now();
        const result = await pool.query('SELECT NOW()');
        const duration = Date.now() - start;
        res.json({
            success: true,
            db_time: result.rows[0].now,
            duration_ms: duration,
            message: 'Connexion à la base de données réussie'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            stack: err.stack
        });
    }
});

// API Routes
const authRoutes = require('./routes/auth');
const adRoutes = require('./routes/ads');
const adminRoutes = require('./routes/admin');
const deliveryPersonsRoutes = require('./routes/deliveryPersons');

app.use('/api/auth', authRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/delivery-persons', deliveryPersonsRoutes);

// Static Files for Uploads
app.use('/uploads', express.static('uploads'));

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        msg: 'Route non trouvée',
        code: 'NOT_FOUND',
        path: req.path
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);

    res.status(err.status || 500).json({
        msg: err.message || 'Erreur serveur interne',
        code: err.code || 'SERVER_ERROR',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start Server
// Start Server and Initialize DB
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function initDB() {
    if (process.env.NODE_ENV !== 'production' && !process.env.DATABASE_URL) return;

    // Only run if we are in production or explicitly asked to
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('🔄 Checking database schema...');

        const schemaPath = path.join(__dirname, 'db', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split and execute commands to avoid "cannot insert multiple commands" error with some drivers
        // But for pg library, standard query works for multiple statements
        await client.query(schema);
        console.log('✅ Database schema initialized successfully');
    } catch (err) {
        // Don't crash if table already exists or connection fails, just log
        console.warn('⚠️ Database initialization warning:', err.message);
    } finally {
        await client.end();
    }
}

initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔒 Security: Helmet enabled`);
        console.log(`🌐 CORS: ${corsOptions.origin}`);
    });
});
