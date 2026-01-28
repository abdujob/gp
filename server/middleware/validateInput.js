const { body, validationResult } = require('express-validator');
const validator = require('validator');

/**
 * Middleware to check validation results
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            msg: 'Erreur de validation',
            errors: errors.array().map(err => ({
                field: err.path || err.param,
                message: err.msg
            }))
        });
    }
    next();
};

/**
 * Validation rules for user registration
 */
const validateRegistration = [
    body('full_name')
        .trim()
        .notEmpty()
        .withMessage('Le nom complet est requis')
        .isLength({ min: 2, max: 100 })
        .withMessage('Le nom doit contenir entre 2 et 100 caractères')
        .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
        .withMessage('Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets'),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('L\'email est requis')
        .isEmail()
        .withMessage('Email invalide')
        .normalizeEmail()
        .custom((value) => {
            // Additional email validation
            if (!validator.isEmail(value)) {
                throw new Error('Format d\'email invalide');
            }
            return true;
        }),

    body('password')
        .notEmpty()
        .withMessage('Le mot de passe est requis')
        .isLength({ min: 8 })
        .withMessage('Le mot de passe doit contenir au moins 8 caractères')
        .matches(/[a-z]/)
        .withMessage('Le mot de passe doit contenir au moins une lettre minuscule')
        .matches(/[A-Z]/)
        .withMessage('Le mot de passe doit contenir au moins une lettre majuscule')
        .matches(/[0-9]/)
        .withMessage('Le mot de passe doit contenir au moins un chiffre')
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage('Le mot de passe doit contenir au moins un caractère spécial'),

    body('role')
        .optional()
        .isIn(['EXPEDITEUR', 'LIVREUR_GP'])
        .withMessage('Le rôle doit être EXPEDITEUR ou LIVREUR_GP'),

    handleValidationErrors
];

/**
 * Validation rules for user login
 */
const validateLogin = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('L\'email est requis')
        .isEmail()
        .withMessage('Email invalide')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Le mot de passe est requis'),

    handleValidationErrors
];

/**
 * Validation rules for password reset request
 */
const validatePasswordResetRequest = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('L\'email est requis')
        .isEmail()
        .withMessage('Email invalide')
        .normalizeEmail(),

    handleValidationErrors
];

/**
 * Validation rules for password reset
 */
const validatePasswordReset = [
    body('token')
        .notEmpty()
        .withMessage('Le token est requis')
        .isLength({ min: 32, max: 64 })
        .withMessage('Token invalide'),

    body('password')
        .notEmpty()
        .withMessage('Le mot de passe est requis')
        .isLength({ min: 8 })
        .withMessage('Le mot de passe doit contenir au moins 8 caractères')
        .matches(/[a-z]/)
        .withMessage('Le mot de passe doit contenir au moins une lettre minuscule')
        .matches(/[A-Z]/)
        .withMessage('Le mot de passe doit contenir au moins une lettre majuscule')
        .matches(/[0-9]/)
        .withMessage('Le mot de passe doit contenir au moins un chiffre')
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage('Le mot de passe doit contenir au moins un caractère spécial'),

    handleValidationErrors
];

/**
 * Validation rules for email verification
 */
const validateEmailVerification = [
    body('token')
        .notEmpty()
        .withMessage('Le token est requis')
        .isLength({ min: 32, max: 64 })
        .withMessage('Token invalide'),

    handleValidationErrors
];

/**
 * Validation rules for refresh token
 */
const validateRefreshToken = [
    body('refreshToken')
        .notEmpty()
        .withMessage('Le refresh token est requis'),

    handleValidationErrors
];

/**
 * Validation rules for profile update
 */
const validateProfileUpdate = [
    body('full_name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Le nom doit contenir entre 2 et 100 caractères')
        .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
        .withMessage('Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets'),

    handleValidationErrors
];

/**
 * Validation rules for password change
 */
const validatePasswordChange = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Le mot de passe actuel est requis'),

    body('newPassword')
        .notEmpty()
        .withMessage('Le nouveau mot de passe est requis')
        .isLength({ min: 8 })
        .withMessage('Le mot de passe doit contenir au moins 8 caractères')
        .matches(/[a-z]/)
        .withMessage('Le mot de passe doit contenir au moins une lettre minuscule')
        .matches(/[A-Z]/)
        .withMessage('Le mot de passe doit contenir au moins une lettre majuscule')
        .matches(/[0-9]/)
        .withMessage('Le mot de passe doit contenir au moins un chiffre')
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage('Le mot de passe doit contenir au moins un caractère spécial')
        .custom((value, { req }) => {
            if (value === req.body.currentPassword) {
                throw new Error('Le nouveau mot de passe doit être différent de l\'ancien');
            }
            return true;
        }),

    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    validateRegistration,
    validateLogin,
    validatePasswordResetRequest,
    validatePasswordReset,
    validateEmailVerification,
    validateRefreshToken,
    validateProfileUpdate,
    validatePasswordChange
};
