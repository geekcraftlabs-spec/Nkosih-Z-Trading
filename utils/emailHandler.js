export async function sendEmail(to, templateParams, templateId) {
  // Use the provided template ID or fallback to the default
  const template = templateId || process.env.EMAILJS_TEMPLATE_ID;

  const payload = {
    service_id: process.env.EMAILJS_SERVICE_ID,
    template_id: template,
    user_id: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
    accessToken: process.env.EMAILJS_PRIVATE_KEY,
    template_params: {
      email: to,
      full_name: templateParams.full_name || 'Guest',
      code: templateParams.code || 'N/A',
      service_type: templateParams.service_type || 'Service',
      total_price: templateParams.total_price || 'R0',
      monthly_amount: templateParams.monthly_amount || 'R0',
      repayment_months: templateParams.repayment_months || '0',
      status: templateParams.status || 'Pending',
      link: templateParams.link || '', // For approval emails
    }
  };

  console.log('\x1b[35m%s\x1b[0m', '📧━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 SENDING REAL EMAIL VIA EMAILJS');
  console.log('📧 To:', to);
  console.log('📧 Template:', template);
  console.log('📧 Variables:', JSON.stringify(payload.template_params, null, 2));
  console.log('\x1b[35m%s\x1b[0m', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`EmailJS Error (${response.status}): ${errorText}`);
    }

    console.log('\x1b[32m%s\x1b[0m', '✅ Email sent successfully!');
    return { success: true };
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Email failed:', error.message);
    return { success: false, error: error.message };
  }
}