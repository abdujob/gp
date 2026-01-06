const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

/**
 * Add email verification and password reset fields to users table
 */
async function addEmailVerificationFields() {
    const client = await pool.connect();

    try {
        console.log('🔄 Adding email verification and password reset fields...\n');

        await client.query('BEGIN');

        // Add email verification token field
        console.log('📝 Adding email_verification_token column...');
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255)
        `);

        // Add email verification expiry field
        console.log('📝 Adding email_verification_expiry column...');
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS email_verification_expiry TIMESTAMP
        `);

        // Add password reset token field
        console.log('📝 Adding password_reset_token column...');
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255)
        `);

        // Add password reset expiry field
        console.log('📝 Adding password_reset_expiry column...');
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS password_reset_expiry TIMESTAMP
        `);

        // Create index on email verification token
        console.log('📝 Creating index on email_verification_token...');
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_users_email_verification_token 
            ON users(email_verification_token)
        `);

        // Create index on password reset token
        console.log('📝 Creating index on password_reset_token...');
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_users_password_reset_token 
            ON users(password_reset_token)
        `);

        await client.query('COMMIT');

        console.log('\n✅ Email verification fields added successfully!');
        console.log('\n📊 Summary:');
        console.log('   ✓ Added email_verification_token and expiry');
        console.log('   ✓ Added password_reset_token and expiry');
        console.log('   ✓ Created indexes for performance\n');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err.message);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run migration
if (require.main === module) {
    addEmailVerificationFields()
        .then(() => {
            console.log('🎉 Migration completed!');
            process.exit(0);
        })
        .catch(err => {
            console.error('💥 Migration failed:', err);
            process.exit(1);
        });
}

module.exports = addEmailVerificationFields;
