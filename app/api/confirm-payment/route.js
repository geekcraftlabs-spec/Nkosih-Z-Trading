import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.POSTGRES_URL);

export async function POST(req) {
    const { code } = await req.json();

    console.log('🔍 Confirm Payment API called with code:', code);

    if (!code) {
        console.log('❌ No code provided');
        return Response.json({ error: 'Code required' }, { status: 400 });
    }

    try {
        // First, check if the application exists and is active
        const checkResult = await sql`
            SELECT code, status, full_name, total_price, monthly_amount 
            FROM applications 
            WHERE code = ${code}
        `;

        console.log('🔍 Found application:', checkResult);

        if (!checkResult || checkResult.length === 0) {
            console.log('❌ Application not found for code:', code);
            return Response.json({ error: 'Application not found' }, { status: 404 });
        }

        const app = checkResult[0];

        if (app.status !== 'active') {
            console.log('❌ Application status is not active:', app.status);
            return Response.json({ error: 'Application is not active' }, { status: 400 });
        }

        // Update the application with the first payment
        const result = await sql`
            UPDATE applications 
            SET total_paid = monthly_amount,
                next_billing = TO_CHAR(CURRENT_DATE + INTERVAL '30 days', 'YYYY-MM-DD')
            WHERE code = ${code}
            RETURNING *
        `;

        console.log('✅ Payment confirmed for:', code);
        console.log('✅ Updated application:', result[0]);

        return Response.json({
            success: true,
            message: 'First payment successful! Subscription is active.',
            app: result[0],
        });
    } catch (error) {
        console.error('❌ Confirm payment error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}