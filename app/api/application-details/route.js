import { readDB } from '@/utils/fileHandler';

export async function GET(req) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const db = readDB();

  // Search in both pending and active
  const all = [...db.pending, ...db.active];
  const app = all.find(item => item.code === code);

  if (!app) {
    return Response.json({ error: 'Application not found' }, { status: 404 });
  }

  return Response.json(app);
}