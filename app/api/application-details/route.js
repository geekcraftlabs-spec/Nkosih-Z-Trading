import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.POSTGRES_URL);

export async function GET(req) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    console.log('🔍 Application Details API called with code:', code);

    if (!code) {
        console.log('❌ No code provided');
        return Response.json({ error: 'Code required' }, { status: 400 });
    }

    try {
        // Query the database directly, looking for the code in ANY status
        const result = await sql`
            SELECT 
                id, code, full_name, email, phone, 
                service_type, total_price, repayment_months, 
                monthly_amount, status, total_paid, 
                next_billing, approved_at, created_at
            FROM applications 
            WHERE code = ${code}
        `;

        console.log('🔍 Query result:', result);

        if (!result || result.length === 0) {
            console.log('❌ Application not found for code:', code);
            return Response.json({ error: 'Application not found' }, { status: 404 });
        }

        const app = result[0];
        console.log('✅ Found application:', app.code, 'status:', app.status);

        // Return the application data in the format the frontend expects
        return Response.json({
            code: app.code,
            fullName: app.full_name,
            email: app.email,
            phone: app.phone,
            serviceType: app.service_type,
            totalPrice: app.total_price,
            repaymentMonths: app.repayment_months,
            monthlyAmount: app.monthly_amount,
            status: app.status,
            totalPaid: app.total_paid,
            nextBilling: app.next_billing,
            approvedAt: app.approved_at,
        });
    } catch (error) {
        console.error('❌ Database error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}