import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.POSTGRES_URL);

export async function POST(req) {
    const { email, password } = await req.json();

    if (!email || !password) {
        return Response.json({ error: 'Email and password required' }, { status: 400 });
    }

    try {
        const result = await sql`
            SELECT * FROM admin_users WHERE email = ${email}
        `;

        if (result.length === 0) {
            return Response.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const user = result[0];

        // First-time setup: if hash is the temporary placeholder, check plaintext and then hash
        if (user.password_hash === 'temp_hash_will_be_replaced') {
            if (password === 'admin#2026') {
                const hashedPassword = await bcrypt.hash(password, 10);
                await sql`
                    UPDATE admin_users 
                    SET password_hash = ${hashedPassword}
                    WHERE email = ${email}
                `;
                return Response.json({ success: true });
            } else {
                return Response.json({ error: 'Invalid credentials' }, { status: 401 });
            }
        }

        // Normal password verification
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return Response.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        return Response.json({ success: true });
    } catch (error) {
        console.error('Login error:', error);
        return Response.json({ error: 'Server error' }, { status: 500 });
    }
}