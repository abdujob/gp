const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for login attempts
 * 5 attempts per 15 minutes per IP
 */
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: {
        msg: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    skipSuccessfulRequests: false, // Count successful requests
    handler: (req, res) => {
        res.status(429).json({
            msg: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

/**
 * Rate limiter for registration
 * 3 registrations per hour per IP
 */
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Increased to 20 for testing/launch
    message: {
        msg: 'Trop de tentatives d\'inscription. Veuillez réessayer dans 1 heure.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful registrations
    handler: (req, res) => {
        res.status(429).json({
            msg: 'Trop de tentatives d\'inscription. Veuillez réessayer dans 1 heure.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

/**
 * Rate limiter for password reset requests
 * 3 requests per hour per IP
 */
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 requests per window
    message: {
        msg: 'Trop de demandes de réinitialisation. Veuillez réessayer dans 1 heure.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            msg: 'Trop de demandes de réinitialisation. Veuillez réessayer dans 1 heure.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

/**
 * Rate limiter for email verification resend
 * 5 requests per hour per IP
 */
const emailVerificationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 requests per window
    message: {
        msg: 'Trop de demandes de vérification. Veuillez réessayer dans 1 heure.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            msg: 'Trop de demandes de vérification. Veuillez réessayer dans 1 heure.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
        msg: 'Trop de requêtes. Veuillez réessayer plus tard.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            msg: 'Trop de requêtes. Veuillez réessayer plus tard.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

/**
 * Strict rate limiter for sensitive operations
 * 10 requests per hour per IP
 */
const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 requests per window
    message: {
        msg: 'Trop de requêtes pour cette opération sensible. Veuillez réessayer dans 1 heure.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            msg: 'Trop de requêtes pour cette opération sensible. Veuillez réessayer dans 1 heure.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

module.exports = {
    loginLimiter,
    registerLimiter,
    passwordResetLimiter,
    emailVerificationLimiter,
    apiLimiter,
    strictLimiter
};
