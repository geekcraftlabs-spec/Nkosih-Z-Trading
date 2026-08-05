import { createApplication } from '@/utils/db';
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
    };

    // Save to database
    const app = await createApplication(newApp);

    // Send Email #1: Application Received
    await sendEmail(
        email,
        {
            full_name: app.full_name,
            code: app.code,
            service_type: app.service_type.charAt(0).toUpperCase() + app.service_type.slice(1),
            total_price: `R${app.total_price}`,
            monthly_amount: `R${app.monthly_amount}`,
            repayment_months: app.repayment_months.toString(),
            status: 'Pending Approval',
        },
        process.env.EMAILJS_TEMPLATE_ID
    );

    return Response.json({
        success: true,
        code: app.code,
        app: app,
    });
}