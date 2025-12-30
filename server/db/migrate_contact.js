const pool = require('./index');

const migrate = async () => {
    try {
        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);");
        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;");
        // Optional: Update existing 'user' roles to 'expediteur' and 'expediteur' to 'livreur' if needed? 
        // For now, let's just add columns. User mapping logic is tricky with existing data, 
        // assumed fresh or manual handling.
        console.log("Migration successful: added phone and address columns");
    } catch (err) {
        console.error("Migration failed", err);
    } finally {
        process.exit();
    }
};

migrate();
