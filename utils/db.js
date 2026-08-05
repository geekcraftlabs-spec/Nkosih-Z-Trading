import { neon } from '@neondatabase/serverless';

// Get the connection string from environment
const sql = neon(process.env.POSTGRES_URL);

export async function getPendingApplications() {
    const result = await sql`
        SELECT * FROM applications WHERE status = 'pending' ORDER BY created_at DESC
    `;
    return result;
}

export async function getActiveApplications() {
    const result = await sql`
        SELECT * FROM applications WHERE status = 'active' ORDER BY created_at DESC
    `;
    return result;
}

export async function getApplicationByCode(code) {
    const result = await sql`
        SELECT * FROM applications WHERE code = ${code}
    `;
    return result[0] || null;
}

export async function createApplication(app) {
    const result = await sql`
        INSERT INTO applications (
            id, code, full_name, email, phone, service_type, 
            total_price, repayment_months, monthly_amount, status
        ) VALUES (
            ${app.id}, ${app.code}, ${app.fullName}, ${app.email}, ${app.phone},
            ${app.serviceType}, ${app.totalPrice}, ${app.repaymentMonths},
            ${app.monthlyAmount}, 'pending'
        )
        RETURNING *
    `;
    return result[0];
}

export async function approveApplications(codes) {
    const result = await sql`
        UPDATE applications 
        SET status = 'active', 
            approved_at = CURRENT_TIMESTAMP,
            next_billing = TO_CHAR(CURRENT_DATE + INTERVAL '30 days', 'YYYY-MM-DD')
        WHERE code = ANY(${codes})
        RETURNING *
    `;
    return result;
}

export async function confirmPayment(code) {
    const result = await sql`
        UPDATE applications 
        SET status = 'active',
            total_paid = monthly_amount,
            next_billing = TO_CHAR(CURRENT_DATE + INTERVAL '30 days', 'YYYY-MM-DD')
        WHERE code = ${code}
        RETURNING *
    `;
    return result[0];
}

export async function updateAdminPassword(email, hashedPassword) {
    const result = await sql`
        UPDATE admin_users 
        SET password_hash = ${hashedPassword}
        WHERE email = ${email}
        RETURNING *
    `;
    return result[0];
}