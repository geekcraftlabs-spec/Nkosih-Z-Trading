import { readDB, writeDB } from '@/utils/fileHandler';
import { sendEmail } from '@/utils/emailHandler';

export async function POST(req) {
  const { codes } = await req.json();

  if (!codes || codes.length === 0) {
    return Response.json({ error: 'No codes provided' }, { status: 400 });
  }

  const db = readDB();
  const approvedApps = [];
  const remainingPending = [];

  db.pending.forEach(app => {
    if (codes.includes(app.code)) {
      app.status = 'active';
      app.nextBilling = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();
      app.totalPaid = 0;
      approvedApps.push(app);
      db.active.push(app);
    } else {
      remainingPending.push(app);
    }
  });

  db.pending = remainingPending;
  writeDB(db);

  // Send Email #2: Approval with Payment Link (using template_pm8sig7)
  for (const app of approvedApps) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const link = `${baseUrl}/complete?code=${app.code}`;

    const emailResult = await sendEmail(
      app.email,
      {
        full_name: app.fullName,
        code: app.code,
        service_type: app.serviceType.charAt(0).toUpperCase() + app.serviceType.slice(1),
        total_price: `R${app.totalPrice}`,
        monthly_amount: `R${app.monthlyAmount}`,
        repayment_months: app.repaymentMonths.toString(),
        status: 'Approved - Click to Pay',
        link: link, // ← This becomes {{link}} in your template!
      },
      process.env.EMAILJS_APPROVAL_TEMPLATE_ID // template_pm8sig7
    );

    console.log(`📧 Approval email sent to ${app.email} with link: ${link}`);
  }

  return Response.json({
    success: true,
    approved: approvedApps.length,
    emailsSent: approvedApps.length,
  });
}