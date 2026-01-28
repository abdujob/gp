const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db');
const auth = require('../middleware/auth');
const {
    validateRegistration,
    validateLogin,
    validateRefreshToken,
    validatePasswordChange,
    validatePasswordResetRequest,
    validatePasswordReset,
    validateEmailVerification
} = require('../middleware/validateInput');
const {
    loginLimiter,
    registerLimiter,
    passwordResetLimiter,
    emailVerificationLimiter
} = require('../middleware/rateLimiter');
const {
    generateTokenPair,
    sanitizeUser,
    isAccountLocked,
    calculateLockDuration,
    generateEmailVerificationToken,
    generatePasswordResetToken,
    hashToken
} = require('../utils/authUtils');
const {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail
} = require('../utils/emailService');

// @route   POST /api/auth/register
// @desc    Register new user with email verification
// @access  Public
router.post('/register', registerLimiter, validateRegistration, async (req, res) => {
    const { full_name, email, password, role } = req.body;

    try {
        // Check if user already exists
        const userCheck = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND provider = $2',
            [email, 'LOCAL']
        );

        if (userCheck.rows.length > 0) {
            return res.status(400).json({
                msg: 'Un compte avec cet email existe déjà.',
                code: 'EMAIL_EXISTS'
            });
        }

        // Hash password with bcrypt
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Validate and set role (default to EXPEDITEUR)
        const validRoles = ['LIVREUR_GP', 'EXPEDITEUR'];
        const userRole = validRoles.includes(role) ? role : 'LIVREUR_GP';

        // Generate email verification token
        const verificationToken = generateEmailVerificationToken();
        const verificationTokenHash = hashToken(verificationToken);
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Insert new user with verification token
        const newUser = await pool.query(
            `INSERT INTO users (
                full_name, email, password_hash, role,
                provider, is_email_verified, email_verification_token, 
                email_verification_expiry
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, full_name, email, role, avatar_url, 
                      provider, is_email_verified, created_at`,
            [full_name, email, password_hash, userRole,
                'LOCAL', false, verificationTokenHash, verificationTokenExpiry]
        );

        const user = newUser.rows[0];

        // Send verification email
        await sendVerificationEmail(email, full_name, verificationToken);

        // Generate access and refresh tokens
        const { accessToken, refreshToken, refreshTokenHash } = generateTokenPair(user);

        // Store refresh token hash in database
        await pool.query(
            'UPDATE users SET refresh_token = $1 WHERE id = $2',
            [refreshTokenHash, user.id]
        );

        // Return tokens and sanitized user data
        res.status(201).json({
            msg: 'Compte créé avec succès. Veuillez vérifier votre email.',
            accessToken,
            refreshToken,
            user: sanitizeUser(user),
            emailSent: true
        });

    } catch (err) {
        console.error('Registration error:', err.message);
        res.status(500).json({
            msg: 'Erreur serveur lors de la création du compte',
            code: 'SERVER_ERROR'
        });
    }
});

// @route   POST /api/auth/verify-email
// @desc    Verify user email with token
// @access  Public
router.post('/verify-email', validateEmailVerification, async (req, res) => {
    const { token } = req.body;

    try {
        const tokenHash = hashToken(token);

        // Find user with this verification token
        const userResult = await pool.query(
            `SELECT * FROM users 
             WHERE email_verification_token = $1 
             AND email_verification_expiry > NOW()
             AND is_email_verified = FALSE`,
            [tokenHash]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({
                msg: 'Token de vérification invalide ou expiré',
                code: 'INVALID_TOKEN'
            });
        }

        const user = userResult.rows[0];

        // Mark email as verified
        await pool.query(
            `UPDATE users 
             SET is_email_verified = TRUE, 
                 email_verification_token = NULL,
                 email_verification_expiry = NULL,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [user.id]
        );

        // Send welcome email
        await sendWelcomeEmail(user.email, user.full_name, user.role);

        res.json({
            msg: 'Email vérifié avec succès !',
            code: 'EMAIL_VERIFIED'
        });

    } catch (err) {
        console.error('Email verification error:', err.message);
        res.status(500).json({
            msg: 'Erreur serveur',
            code: 'SERVER_ERROR'
        });
    }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend email verification link
// @access  Private
router.post('/resend-verification', [auth, emailVerificationLimiter], async (req, res) => {
    try {
        // Get user
        const userResult = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [req.user.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                msg: 'Utilisateur non trouvé',
                code: 'USER_NOT_FOUND'
            });
        }

        const user = userResult.rows[0];

        // Check if already verified
        if (user.is_email_verified) {
            return res.status(400).json({
                msg: 'Email déjà vérifié',
                code: 'ALREADY_VERIFIED'
            });
        }

        // Generate new verification token
        const verificationToken = generateEmailVerificationToken();
        const verificationTokenHash = hashToken(verificationToken);
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Update user with new token
        await pool.query(
            `UPDATE users 
             SET email_verification_token = $1,
                 email_verification_expiry = $2,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $3`,
            [verificationTokenHash, verificationTokenExpiry, user.id]
        );

        // Send verification email
        await sendVerificationEmail(user.email, user.full_name, verificationToken);

        res.json({
            msg: 'Email de vérification renvoyé',
            code: 'EMAIL_SENT'
        });

    } catch (err) {
        console.error('Resend verification error:', err.message);
        res.status(500).json({
            msg: 'Erreur serveur',
            code: 'SERVER_ERROR'
        });
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset email
// @access  Public
router.post('/forgot-password', passwordResetLimiter, validatePasswordResetRequest, async (req, res) => {
    const { email } = req.body;

    try {
        // Find user
        const userResult = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND provider = $2',
            [email, 'LOCAL']
        );

        // Always return success to prevent email enumeration
        if (userResult.rows.length === 0) {
            return res.json({
                msg: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.',
                code: 'EMAIL_SENT'
            });
        }

        const user = userResult.rows[0];

        // Generate password reset token
        const resetToken = generatePasswordResetToken();
        const resetTokenHash = hashToken(resetToken);
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Store reset token
        await pool.query(
            `UPDATE users 
             SET password_reset_token = $1,
                 password_reset_expiry = $2,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $3`,
            [resetTokenHash, resetTokenExpiry, user.id]
        );

        // Send reset email
        await sendPasswordResetEmail(user.email, user.full_name, resetToken);

        res.json({
            msg: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.',
            code: 'EMAIL_SENT'
        });

    } catch (err) {
        console.error('Forgot password error:', err.message);
        res.status(500).json({
            msg: 'Erreur serveur',
            code: 'SERVER_ERROR'
        });
    }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', validatePasswordReset, async (req, res) => {
    const { token, password } = req.body;

    try {
        const tokenHash = hashToken(token);

        // Find user with this reset token
        const userResult = await pool.query(
            `SELECT * FROM users 
             WHERE password_reset_token = $1 
             AND password_reset_expiry > NOW()`,
            [tokenHash]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({
                msg: 'Token de réinitialisation invalide ou expiré',
                code: 'INVALID_TOKEN'
            });
        }

        const user = userResult.rows[0];

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(password, salt);

        // Update password and clear reset token
        await pool.query(
            `UPDATE users 
             SET password_hash = $1,
                 password_reset_token = NULL,
                 password_reset_expiry = NULL,
                 failed_login_attempts = 0,
                 account_locked_until = NULL,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [newPasswordHash, user.id]
        );

        res.json({
            msg: 'Mot de passe réinitialisé avec succès',
            code: 'PASSWORD_RESET'
        });

    } catch (err) {
        console.error('Reset password error:', err.message);
        res.status(500).json({
            msg: 'Erreur serveur',
            code: 'SERVER_ERROR'
        });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and return tokens
// @access  Public
router.post('/login', loginLimiter, validateLogin, async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email and provider
        const userResult = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND provider = $2',
            [email, 'LOCAL']
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({
                msg: 'Email ou mot de passe incorrect',
                code: 'INVALID_CREDENTIALS'
            });
        }

        const user = userResult.rows[0];

        // Check if account is locked
        if (isAccountLocked(user)) {
            const lockUntil = new Date(user.account_locked_until);
            const minutesRemaining = Math.ceil((lockUntil - new Date()) / 60000);

            return res.status(403).json({
                msg: `Compte temporairement verrouillé. Réessayez dans ${minutesRemaining} minute(s).`,
                code: 'ACCOUNT_LOCKED',
                lockedUntil: lockUntil.toISOString()
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            // Increment failed login attempts
            const failedAttempts = (user.failed_login_attempts || 0) + 1;
            let updateQuery = 'UPDATE users SET failed_login_attempts = $1';
            const queryParams = [failedAttempts, user.id];

            // Lock account after 5 failed attempts
            if (failedAttempts >= 5) {
                const lockDuration = calculateLockDuration(failedAttempts);
                const lockUntil = new Date(Date.now() + lockDuration * 60000);

                updateQuery += ', account_locked_until = $3';
                queryParams.push(lockUntil);

                await pool.query(updateQuery + ' WHERE id = $2', queryParams);

                return res.status(403).json({
                    msg: `Trop de tentatives échouées. Compte verrouillé pour ${lockDuration} minutes.`,
                    code: 'ACCOUNT_LOCKED',
                    lockedUntil: lockUntil.toISOString()
                });
            }

            await pool.query(updateQuery + ' WHERE id = $2', queryParams);

            return res.status(400).json({
                msg: 'Email ou mot de passe incorrect',
                code: 'INVALID_CREDENTIALS',
                attemptsRemaining: 5 - failedAttempts
            });
        }

        // Successful login - reset failed attempts
        await pool.query(
            'UPDATE users SET failed_login_attempts = 0, account_locked_until = NULL WHERE id = $1',
            [user.id]
        );

        // Generate tokens
        const { accessToken, refreshToken, refreshTokenHash } = generateTokenPair(user);

        // Store refresh token hash
        await pool.query(
            'UPDATE users SET refresh_token = $1 WHERE id = $2',
            [refreshTokenHash, user.id]
        );

        // Return tokens and user data
        res.json({
            msg: 'Connexion réussie',
            accessToken,
            refreshToken,
            user: sanitizeUser(user)
        });

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({
            msg: 'Erreur serveur lors de la connexion',
            code: 'SERVER_ERROR'
        });
    }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token using refresh token
// @access  Public
router.post('/refresh', validateRefreshToken, async (req, res) => {
    const { refreshToken } = req.body;

    try {
        const { verifyToken, hashRefreshToken, generateAccessToken } = require('../utils/authUtils');
        const decoded = verifyToken(refreshToken);

        if (!decoded || decoded.user.type !== 'refresh') {
            return res.status(401).json({
                msg: 'Refresh token invalide',
                code: 'INVALID_REFRESH_TOKEN'
            });
        }

        // Get user and verify refresh token hash
        const userResult = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [decoded.user.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                msg: 'Utilisateur non trouvé',
                code: 'USER_NOT_FOUND'
            });
        }

        const user = userResult.rows[0];

        // Verify refresh token hash matches
        const tokenHash = hashRefreshToken(refreshToken);
        if (tokenHash !== user.refresh_token) {
            return res.status(401).json({
                msg: 'Refresh token invalide',
                code: 'INVALID_REFRESH_TOKEN'
            });
        }

        // Check if account is locked
        if (isAccountLocked(user)) {
            return res.status(403).json({
                msg: 'Compte verrouillé',
                code: 'ACCOUNT_LOCKED'
            });
        }

        // Generate new access token
        const accessToken = generateAccessToken(user);

        res.json({
            msg: 'Token rafraîchi avec succès',
            accessToken
        });

    } catch (err) {
        console.error('Refresh token error:', err.message);

        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                msg: 'Refresh token expiré. Veuillez vous reconnecter.',
                code: 'REFRESH_TOKEN_EXPIRED'
            });
        }

        res.status(500).json({
            msg: 'Erreur serveur',
            code: 'SERVER_ERROR'
        });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user (invalidate refresh token)
// @access  Private
router.post('/logout', auth, async (req, res) => {
    try {
        // Invalidate refresh token
        await pool.query(
            'UPDATE users SET refresh_token = NULL WHERE id = $1',
            [req.user.id]
        );

        res.json({
            msg: 'Déconnexion réussie'
        });

    } catch (err) {
        console.error('Logout error:', err.message);
        res.status(500).json({
            msg: 'Erreur serveur',
            code: 'SERVER_ERROR'
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const userResult = await pool.query(
            `SELECT id, full_name, email, role, avatar_url, 
                    provider, is_email_verified, created_at, updated_at
             FROM users WHERE id = $1`,
            [req.user.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                msg: 'Utilisateur non trouvé',
                code: 'USER_NOT_FOUND'
            });
        }

        res.json(userResult.rows[0]);

    } catch (err) {
        console.error('Get user error:', err.message);
        res.status(500).json({
            msg: 'Erreur serveur',
            code: 'SERVER_ERROR'
        });
    }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', auth, validatePasswordChange, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        // Get user with password
        const userResult = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [req.user.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                msg: 'Utilisateur non trouvé',
                code: 'USER_NOT_FOUND'
            });
        }

        const user = userResult.rows[0];

        // Check if user has local authentication
        if (user.provider !== 'LOCAL' || !user.password_hash) {
            return res.status(400).json({
                msg: 'Impossible de changer le mot de passe pour un compte OAuth',
                code: 'OAUTH_ACCOUNT'
            });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({
                msg: 'Mot de passe actuel incorrect',
                code: 'INVALID_PASSWORD'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        // Update password
        await pool.query(
            'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [newPasswordHash, user.id]
        );

        res.json({
            msg: 'Mot de passe modifié avec succès'
        });

    } catch (err) {
        console.error('Change password error:', err.message);
        res.status(500).json({
            msg: 'Erreur serveur',
            code: 'SERVER_ERROR'
        });
    }
});

module.exports = router;
