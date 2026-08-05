import { readDB } from '@/utils/fileHandler';

export async function GET(req) {
  const db = readDB();
  const url = new URL(req.url);
  const status = url.searchParams.get('status');

  let data = [];
  if (status === 'pending') data = db.pending;
  else if (status === 'active') data = db.active;
  else data = { pending: db.pending, active: db.active };

  return Response.json(data);
}