import fs from 'fs';
import path from 'path';
import os from 'os';

// Use system temp folder so it works on Windows perfectly
const DB_PATH = path.join(os.tmpdir(), 'debit-order-demo-db.json');
const SEED = { pending: [], active: [] };

export function readDB() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) { console.error('Read error', e); }
  // If file doesn't exist, create it with seed data
  writeDB(SEED);
  return SEED;
}

export function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}