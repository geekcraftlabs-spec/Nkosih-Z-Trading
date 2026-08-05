import { neon } from '@neondatabase/serverless';
import { sendEmail } from '@/utils/emailHandler';

const sql = neon(process.env.POSTGRES_URL);

export async function POST(req) {
  const { code } = await req.json();

  if (!code) {
    return Response.json({ error: 'Code required' }, { status: 400 });
  }

  try {
    const appResult = await sql`
      SELECT * FROM applications WHERE code = ${code}
    `;
    const app = appResult[0];

    if (!app) {
      return Response.json({ error: 'Application not found' }, { status: 404 });
    }

    if (app.status !== 'active') {
      return Response.json({ error: 'Only active applications can be reminded' }, { status: 400 });
    }

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
        status: 'Reminder - Complete Your Payment',
        link: link,
      },
      process.env.EMAILJS_APPROVAL_TEMPLATE_ID
    );

    // Update last reminder timestamp
    await sql`
      UPDATE applications 
      SET last_reminder_sent = CURRENT_TIMESTAMP
      WHERE code = ${code}
    `;

    return Response.json({ success: true, message: 'Reminder email sent' });
  } catch (error) {
    console.error('Resend error:', error);
    return Response.json({ error: 'Failed to resend email' }, { status: 500 });
  }
}