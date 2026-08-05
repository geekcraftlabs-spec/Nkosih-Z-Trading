const { sql } = require('@vercel/postgres');

async function test() {
    try {
        const result = await sql`SELECT COUNT(*) FROM admin_users`;
        console.log('✅ Database connected! Admin users:', result.rows[0].count);
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

test();