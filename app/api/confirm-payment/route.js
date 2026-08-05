import { readDB, writeDB } from '@/utils/fileHandler';

export async function POST(req) {
  const { code } = await req.json();

  if (!code) {
    return Response.json({ error: 'Code required' }, { status: 400 });
  }

  const db = readDB();

  // Find the application in active list
  const appIndex = db.active.findIndex(a => a.code === code);

  if (appIndex === -1) {
    return Response.json({ error: 'Application not found or not approved' }, { status: 404 });
  }

  // Simulate successful first payment
  db.active[appIndex].totalPaid = db.active[appIndex].monthlyAmount;
  db.active[appIndex].nextBilling = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();
  db.active[appIndex].status = 'active';

  writeDB(db);

  return Response.json({
    success: true,
    message: 'First payment successful! Subscription is active.',
    app: db.active[appIndex],
  });
}