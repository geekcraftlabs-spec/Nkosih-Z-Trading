import { readDB, writeDB } from '@/utils/fileHandler';
import { sendEmail } from '@/utils/emailHandler';

export async function POST(req) {
  const body = await req.json();
  const { fullName, email, phone, serviceType, totalPrice, repaymentMonths } = body;

  const prefix = serviceType === 'construction' ? 'C' : 'T';
  const code = `${prefix}-${Date.now().toString().slice(-4)}`;
  const monthlyAmount = (totalPrice / repaymentMonths).toFixed(2);

  const newApp = {
    id: Date.now().toString(),
    code,
    fullName: fullName || 'Guest',
    email,
    phone: phone || '',
    serviceType,
    totalPrice: parseFloat(totalPrice),
    repaymentMonths: parseInt(repaymentMonths),
    monthlyAmount: parseFloat(monthlyAmount),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const db = readDB();
  db.pending.push(newApp);
  writeDB(db);

  // Send Email #1: Application Received (using template_n0xdlng)
  const emailResult = await sendEmail(
    email,
    {
      full_name: newApp.fullName,
      code: code,
      service_type: serviceType.charAt(0).toUpperCase() + serviceType.slice(1),
      total_price: `R${totalPrice}`,
      monthly_amount: `R${monthlyAmount}`,
      repayment_months: repaymentMonths.toString(),
      status: 'Pending Approval',
    },
    process.env.EMAILJS_TEMPLATE_ID // template_n0xdlng
  );

  return Response.json({
    success: true,
    code,
    app: newApp,
    emailSent: emailResult.success,
  });
}