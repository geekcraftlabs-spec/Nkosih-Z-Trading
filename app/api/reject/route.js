import { neon } from '@neondatabase/serverless';
import { sendEmail } from '@/utils/emailHandler';

const sql = neon(process.env.POSTGRES_URL);

export async function POST(req) {
    const { code } = await req.json();

    console.log('🔍 Reject API called with code:', code);

    if (!code) {
        return Response.json({ error: 'Code required' }, { status: 400 });
    }

    try {
        // Get the application
        const appResult = await sql`
            SELECT * FROM applications WHERE code = ${code}
        `;
        const app = appResult[0];

        if (!app) {
            return Response.json({ error: 'Application not found' }, { status: 404 });
        }

        if (app.status !== 'pending') {
            return Response.json({ error: 'Application is not pending' }, { status: 400 });
        }

        // Update status to rejected
        const result = await sql`
            UPDATE applications 
            SET status = 'rejected',
                rejected_at = CURRENT_TIMESTAMP
            WHERE code = ${code}
            RETURNING *
        `;

        console.log('✅ Application rejected:', code);

        // Send rejection email using your existing template (template_55ea4og)
        await sendEmail(
            app.email,
            {
                full_name: app.full_name,
                code: app.code,
                service_type: app.service_type.charAt(0).toUpperCase() + app.service_type.slice(1),
                total_price: `R${app.total_price}`,
                monthly_amount: `R${app.monthly_amount}`,
                repayment_months: app.repayment_months.toString(),
                status: 'Rejected',
                rejection_reason: 'We are unable to proceed with your application at this time.',
            },
            process.env.EMAILJS_REJECTION_TEMPLATE_ID
        );

        return Response.json({
            success: true,
            message: 'Application rejected and email sent',
        });
    } catch (error) {
        console.error('❌ Reject error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}