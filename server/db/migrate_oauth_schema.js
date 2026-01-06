const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

/**
 * Migration script to add OAuth and security fields to users table
 * This script is idempotent - safe to run multiple times
 */
async function migrateOAuthSchema() {
    const client = await pool.connect();

    try {
        console.log('🔄 Starting OAuth schema migration...\n');

        await client.query('BEGIN');

        // 1. Add provider column (default LOCAL for existing users)
        console.log('📝 Adding provider column...');
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS provider VARCHAR(20) DEFAULT 'LOCAL' 
            CHECK (provider IN ('LOCAL', 'GOOGLE', 'APPLE'))
        `);

        // 2. Add provider_id column
        console.log('📝 Adding provider_id column...');
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255)
        `);

        // 3. Add is_email_verified column (default false for existing users)
        console.log('📝 Adding is_email_verified column...');
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE
        `);

        // 4. Add refresh_token column
        console.log('📝 Adding refresh_token column...');
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS refresh_token TEXT
        `);

        // 5. Add failed_login_attempts column
        console.log('📝 Adding failed_login_attempts column...');
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0
        `);

        // 6. Add account_locked_until column
        console.log('📝 Adding account_locked_until column...');
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP
        `);

        // 7. Add updated_at column
        console.log('📝 Adding updated_at column...');
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `);

        // 8. Make password_hash nullable (for OAuth users)
        console.log('📝 Making password_hash nullable...');
        await client.query(`
            ALTER TABLE users 
            ALTER COLUMN password_hash DROP NOT NULL
        `);

        // 9. Make email nullable (for Apple OAuth - can hide email)
        console.log('📝 Making email nullable...');
        await client.query(`
            ALTER TABLE users 
            ALTER COLUMN email DROP NOT NULL
        `);

        // 10. Add unique constraint on provider + provider_id
        console.log('📝 Adding unique constraint on provider + provider_id...');
        await client.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint 
                    WHERE conname = 'users_provider_provider_id_key'
                ) THEN
                    ALTER TABLE users 
                    ADD CONSTRAINT users_provider_provider_id_key 
                    UNIQUE (provider, provider_id);
                END IF;
            END $$;
        `);

        // 11. Update existing lowercase roles to uppercase
        console.log('📝 Updating existing role values to uppercase...');
        await client.query(`
            UPDATE users 
            SET role = UPPER(role) 
            WHERE role IN ('expediteur', 'livreur_gp', 'livreur')
        `);

        // Map old 'livreur' to 'LIVREUR_GP'
        await client.query(`
            UPDATE users 
            SET role = 'LIVREUR_GP' 
            WHERE role = 'LIVREUR'
        `);

        // 12. Update role column to use CHECK constraint
        console.log('📝 Updating role column constraints...');
        await client.query(`
            DO $$ 
            BEGIN
                -- Drop old constraint if exists
                ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
                
                -- Add new constraint
                ALTER TABLE users 
                ADD CONSTRAINT users_role_check 
                CHECK (role IN ('EXPEDITEUR', 'LIVREUR_GP'));
            END $$;
        `);

        // 13. Set existing users as email verified (they already registered)
        console.log('📝 Setting existing users as email verified...');
        await client.query(`
            UPDATE users 
            SET is_email_verified = TRUE 
            WHERE provider = 'LOCAL' AND is_email_verified = FALSE
        `);

        // 14. Create index on provider_id for faster OAuth lookups
        console.log('📝 Creating index on provider_id...');
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_users_provider_id 
            ON users(provider, provider_id)
        `);

        // 15. Create index on email for faster lookups
        console.log('📝 Creating index on email...');
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_users_email 
            ON users(email)
        `);

        await client.query('COMMIT');

        console.log('\n✅ Migration completed successfully!');
        console.log('\n📊 Summary of changes:');
        console.log('   ✓ Added OAuth support (provider, provider_id)');
        console.log('   ✓ Added security fields (failed_login_attempts, account_locked_until)');
        console.log('   ✓ Added email verification support');
        console.log('   ✓ Added refresh token support');
        console.log('   ✓ Made password_hash and email nullable for OAuth');
        console.log('   ✓ Added database indexes for performance');
        console.log('   ✓ Set existing users as email verified\n');

        // Display current schema
        const schemaResult = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'users'
            ORDER BY ordinal_position
        `);

        console.log('📋 Current users table schema:');
        console.table(schemaResult.rows);

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
    migrateOAuthSchema()
        .then(() => {
            console.log('🎉 Migration script completed!');
            process.exit(0);
        })
        .catch(err => {
            console.error('💥 Migration script failed:', err);
            process.exit(1);
        });
}

module.exports = migrateOAuthSchema;
