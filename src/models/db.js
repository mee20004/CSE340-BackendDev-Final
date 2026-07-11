import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const connectionString = process.env.DB_URL || process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error(
        'Missing database connection string. Set DB_URL (local) or DATABASE_URL (Render/Heroku).'
    );
}

const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
});

const logging = process.env.ENABLE_SQL_LOGGING === 'true';

export async function query(text, params) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        if (logging) {
            console.log('Executed query:', {
                text,
                duration: `${Date.now() - start}ms`,
                rows: res.rowCount,
            });
        }
        return res;
    } catch (error) {
        console.error('Error in query:', { text, error: error.message });
        throw error;
    }
}

export async function testConnection() {
    const res = await query('SELECT NOW() as current_time');
    console.log(`Database connection successful: ${res.rows[0].current_time}`);
}

export default pool;
