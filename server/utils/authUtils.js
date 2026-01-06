const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

/**
 * Generate short-lived access token (15 minutes)
 * @param {Object} user - User object with id, email, role
 * @returns {String} JWT access token
 */
function generateAccessToken(user) {
    const payload = {
        user: {
            id: user.id,
            email: user.email,
            role: user.role
        }
    };

    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
    );
}

/**
 * Generate long-lived refresh token (7 days)
 * @param {Object} user - User object with id
 * @returns {String} JWT refresh token
 */
function generateRefreshToken(user) {
    const payload = {
        user: {
            id: user.id,
            type: 'refresh'
        }
    };

    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
    );
}

/**
 * Hash refresh token for secure storage in database
 * @param {String} token - Refresh token to hash
 * @returns {String} Hashed token
 */
function hashRefreshToken(token) {
    return crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
}

/**
 * Verify refresh token against stored hash
 * @param {String} token - Token to verify
 * @param {String} hashedToken - Stored hash
 * @returns {Boolean} True if valid
 */
function verifyRefreshToken(token, hashedToken) {
    const hash = hashRefreshToken(token);
    return hash === hashedToken;
}

/**
 * Generate random token for email verification
 * @returns {String} Random token (32 bytes hex)
 */
function generateEmailVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate random token for password reset
 * @returns {String} Random token (32 bytes hex)
 */
function generatePasswordResetToken() {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash password reset token for storage
 * @param {String} token - Token to hash
 * @returns {String} Hashed token
 */
function hashToken(token) {
    return crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
}

/**
 * Validate password strength
 * @param {String} password - Password to validate
 * @returns {Object} { valid: Boolean, errors: Array }
 */
function validatePasswordStrength(password) {
    const errors = [];

    if (!password || password.length < 8) {
        errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Le mot de passe doit contenir au moins une lettre minuscule');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Le mot de passe doit contenir au moins une lettre majuscule');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Le mot de passe doit contenir au moins un chiffre');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Verify JWT token
 * @param {String} token - Token to verify
 * @returns {Object} Decoded token payload or null
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return null;
    }
}

/**
 * Generate both access and refresh tokens
 * @param {Object} user - User object
 * @returns {Object} { accessToken, refreshToken, refreshTokenHash }
 */
function generateTokenPair(user) {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const refreshTokenHash = hashRefreshToken(refreshToken);

    return {
        accessToken,
        refreshToken,
        refreshTokenHash
    };
}

/**
 * Check if account is locked
 * @param {Object} user - User object with account_locked_until
 * @returns {Boolean} True if account is locked
 */
function isAccountLocked(user) {
    if (!user.account_locked_until) {
        return false;
    }

    const lockUntil = new Date(user.account_locked_until);
    const now = new Date();

    return now < lockUntil;
}

/**
 * Calculate account lock duration based on failed attempts
 * @param {Number} failedAttempts - Number of failed login attempts
 * @returns {Number} Lock duration in minutes
 */
function calculateLockDuration(failedAttempts) {
    // Progressive lockout:
    // 5 attempts: 15 minutes
    // 10 attempts: 30 minutes
    // 15+ attempts: 60 minutes

    if (failedAttempts >= 15) {
        return 60;
    } else if (failedAttempts >= 10) {
        return 30;
    } else {
        return 15;
    }
}

/**
 * Sanitize user object for response (remove sensitive fields)
 * @param {Object} user - User object from database
 * @returns {Object} Sanitized user object
 */
function sanitizeUser(user) {
    const {
        password_hash,
        refresh_token,
        failed_login_attempts,
        account_locked_until,
        provider_id,
        ...sanitized
    } = user;

    return sanitized;
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    hashRefreshToken,
    verifyRefreshToken,
    generateEmailVerificationToken,
    generatePasswordResetToken,
    hashToken,
    validatePasswordStrength,
    verifyToken,
    generateTokenPair,
    isAccountLocked,
    calculateLockDuration,
    sanitizeUser
};
