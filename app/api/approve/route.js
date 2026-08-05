import { neon } from '@neondatabase/serverless';
import { sendEmail } from '@/utils/emailHandler';

const sql = neon(process.env.POSTGRES_URL);

export async function POST(req) {
    const { codes } = await req.json();

    console.log('🔍 Approve API called');
    console.log('🔍 Codes received:', codes);

    if (!codes || codes.length === 0) {
        console.log('❌ No codes provided');
        return Response.json({ error: 'No codes provided' }, { status: 400 });
    }

    try {
        // First, check what applications exist with these codes
        const checkResult = await sql`
            SELECT code, status, full_name FROM applications WHERE code = ANY(${codes})
        `;
        console.log('🔍 Found in DB:', checkResult);

        const pendingCodes = checkResult.filter(row => row.status === 'pending').map(row => row.code);
        console.log('🔍 Pending codes to approve:', pendingCodes);

        if (pendingCodes.length === 0) {
            console.log('❌ No pending applications found');
            return Response.json({
                success: false,
                error: 'No pending applications found for these codes',
                approved: 0
            });
        }

        // Update only the pending ones
        const result = await sql`
            UPDATE applications 
            SET status = 'active', 
                approved_at = CURRENT_TIMESTAMP,
                next_billing = TO_CHAR(CURRENT_DATE + INTERVAL '30 days', 'YYYY-MM-DD')
            WHERE code = ANY(${pendingCodes})
            RETURNING *
        `;

        console.log('✅ Updated applications:', result);

        // Send approval emails
        for (const app of result) {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
            const link = `${baseUrl}/complete?code=${app.code}`;

            await sendEmail(
                app.email,
                {
                    full_name: app.full_name,
                    code: app.code,
                    service_type: app.service_type.charAt(0).toUpperCase() + app.service_type.slice(1),
                    total_price: `R${app.total_price}`,
                    monthly_amount: `R${app.monthly_amount}`,
                    repayment_months: app.repayment_months.toString(),
                    status: 'Approved - Click to Pay',
                    link: link,
                },
                process.env.EMAILJS_APPROVAL_TEMPLATE_ID
            );
            console.log(`📧 Approval email sent to ${app.email}`);
        }

        return Response.json({
            success: true,
            approved: result.length,
        });
    } catch (error) {
        console.error('❌ Approve error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}