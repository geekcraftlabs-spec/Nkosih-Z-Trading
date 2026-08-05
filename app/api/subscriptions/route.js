import { getPendingApplications, getActiveApplications } from '@/utils/db';

export async function GET(req) {
    const url = new URL(req.url);
    const status = url.searchParams.get('status');

    try {
        if (status === 'pending') {
            const data = await getPendingApplications();
            return Response.json(data);
        } else if (status === 'active') {
            const data = await getActiveApplications();
            return Response.json(data);
        } else {
            const pending = await getPendingApplications();
            const active = await getActiveApplications();
            return Response.json({ pending, active });
        }
    } catch (error) {
        console.error('API error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}