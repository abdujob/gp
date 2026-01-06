const nodemailer = require('nodemailer');

/**
 * Email Service for sending verification, reset, and notification emails
 * Uses nodemailer with configurable SMTP settings
 */

// Create reusable transporter
let transporter = null;

/**
 * Initialize email transporter
 */
function initializeTransporter() {
    if (transporter) {
        return transporter;
    }

    // Check if email is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.warn('⚠️  Email service not configured. Set SMTP_* environment variables.');
        return null;
    }

    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    // Verify connection
    transporter.verify((error, success) => {
        if (error) {
            console.error('❌ Email service connection failed:', error.message);
        } else {
            console.log('✅ Email service ready');
        }
    });

    return transporter;
}

/**
 * Send email verification link
 * @param {String} email - User email
 * @param {String} fullName - User full name
 * @param {String} verificationToken - Verification token
 */
async function sendVerificationEmail(email, fullName, verificationToken) {
    const transport = initializeTransporter();

    if (!transport) {
        console.log('📧 Email service not configured - Verification email not sent');
        console.log(`📝 Verification token for ${email}: ${verificationToken}`);
        return { success: false, message: 'Email service not configured' };
    }

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    const mailOptions = {
        from: `"GP - Plateforme de Livraison" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Vérifiez votre adresse email - GP',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🚀 Bienvenue sur GP !</h1>
                    </div>
                    <div class="content">
                        <p>Bonjour <strong>${fullName}</strong>,</p>
                        
                        <p>Merci de vous être inscrit sur GP, la plateforme qui connecte les expéditeurs et les livreurs.</p>
                        
                        <p>Pour activer votre compte et commencer à utiliser nos services, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
                        
                        <div style="text-align: center;">
                            <a href="${verificationUrl}" class="button">Vérifier mon email</a>
                        </div>
                        
                        <p>Ou copiez ce lien dans votre navigateur :</p>
                        <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
                        
                        <p><strong>Ce lien expirera dans 24 heures.</strong></p>
                        
                        <p>Si vous n'avez pas créé de compte sur GP, vous pouvez ignorer cet email.</p>
                        
                        <p>À bientôt,<br>L'équipe GP</p>
                    </div>
                    <div class="footer">
                        <p>© 2026 GP - Tous droits réservés</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
Bonjour ${fullName},

Merci de vous être inscrit sur GP !

Pour activer votre compte, veuillez vérifier votre adresse email en cliquant sur ce lien :
${verificationUrl}

Ce lien expirera dans 24 heures.

Si vous n'avez pas créé de compte sur GP, vous pouvez ignorer cet email.

À bientôt,
L'équipe GP
        `
    };

    try {
        const info = await transport.sendMail(mailOptions);
        console.log('✅ Verification email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending verification email:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Send password reset email
 * @param {String} email - User email
 * @param {String} fullName - User full name
 * @param {String} resetToken - Password reset token
 */
async function sendPasswordResetEmail(email, fullName, resetToken) {
    const transport = initializeTransporter();

    if (!transport) {
        console.log('📧 Email service not configured - Reset email not sent');
        console.log(`📝 Reset token for ${email}: ${resetToken}`);
        return { success: false, message: 'Email service not configured' };
    }

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
        from: `"GP - Plateforme de Livraison" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Réinitialisation de votre mot de passe - GP',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 15px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔒 Réinitialisation de mot de passe</h1>
                    </div>
                    <div class="content">
                        <p>Bonjour <strong>${fullName}</strong>,</p>
                        
                        <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte GP.</p>
                        
                        <p>Pour créer un nouveau mot de passe, cliquez sur le bouton ci-dessous :</p>
                        
                        <div style="text-align: center;">
                            <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
                        </div>
                        
                        <p>Ou copiez ce lien dans votre navigateur :</p>
                        <p style="word-break: break-all; color: #f5576c;">${resetUrl}</p>
                        
                        <div class="warning">
                            <strong>⚠️ Important :</strong>
                            <ul>
                                <li>Ce lien expirera dans 1 heure</li>
                                <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                                <li>Votre mot de passe actuel reste valide jusqu'à ce que vous en créiez un nouveau</li>
                            </ul>
                        </div>
                        
                        <p>Pour votre sécurité, assurez-vous que votre nouveau mot de passe contient :</p>
                        <ul>
                            <li>Au moins 8 caractères</li>
                            <li>Une lettre majuscule et une minuscule</li>
                            <li>Un chiffre</li>
                            <li>Un caractère spécial (!@#$%^&*...)</li>
                        </ul>
                        
                        <p>Cordialement,<br>L'équipe GP</p>
                    </div>
                    <div class="footer">
                        <p>© 2026 GP - Tous droits réservés</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `
Bonjour ${fullName},

Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte GP.

Pour créer un nouveau mot de passe, cliquez sur ce lien :
${resetUrl}

Ce lien expirera dans 1 heure.

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

Cordialement,
L'équipe GP
        `
    };

    try {
        const info = await transport.sendMail(mailOptions);
        console.log('✅ Password reset email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending password reset email:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Send welcome email after email verification
 * @param {String} email - User email
 * @param {String} fullName - User full name
 * @param {String} role - User role
 */
async function sendWelcomeEmail(email, fullName, role) {
    const transport = initializeTransporter();

    if (!transport) {
        return { success: false, message: 'Email service not configured' };
    }

    const roleText = role === 'LIVREUR_GP'
        ? 'livreur'
        : 'expéditeur';

    const mailOptions = {
        from: `"GP - Plateforme de Livraison" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Bienvenue sur GP ! 🎉',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Bienvenue sur GP !</h1>
                    </div>
                    <div class="content">
                        <p>Bonjour <strong>${fullName}</strong>,</p>
                        
                        <p>Votre email a été vérifié avec succès ! Vous pouvez maintenant profiter pleinement de GP en tant que <strong>${roleText}</strong>.</p>
                        
                        <div style="text-align: center;">
                            <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Accéder à mon tableau de bord</a>
                        </div>
                        
                        <p>Besoin d'aide ? N'hésitez pas à nous contacter.</p>
                        
                        <p>Bonne navigation !<br>L'équipe GP</p>
                    </div>
                    <div class="footer">
                        <p>© 2026 GP - Tous droits réservés</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        const info = await transport.sendMail(mailOptions);
        console.log('✅ Welcome email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending welcome email:', error.message);
        return { success: false, error: error.message };
    }
}

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail
};
