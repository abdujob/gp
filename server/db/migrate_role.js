const pool = require('./index');

const migrate = async () => {
    try {
        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';");
        console.log("Migration successful: added role column");
    } catch (err) {
        console.error("Migration failed", err);
    } finally {
        // pool.end() might hang if the pool is not exposing end.
        process.exit();
    }
};

migrate();
