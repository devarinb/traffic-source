// @ts-nocheck
import { getDb } from '@/lib/db';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const db = getDb();
  const { count } = db.prepare('SELECT COUNT(*) as count FROM users').get();

  res.status(200).json({ hasUsers: count > 0 });
}
