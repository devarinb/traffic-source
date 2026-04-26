// @ts-nocheck
import { getDb } from './db';

export function purgeOldPageViews(daysToKeep = 90) {
  const db = getDb();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysToKeep);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const result = db
    .prepare("DELETE FROM page_views WHERE date(timestamp) < ?")
    .run(cutoffStr);

  return { deleted: result.changes };
}

export function getDatabaseSize() {
  const db = getDb();
  const pageCount = db.pragma('page_count', { simple: true });
  const pageSize = db.pragma('page_size', { simple: true });
  const sizeBytes = pageCount * pageSize;

  return {
    bytes: sizeBytes,
    mb: (sizeBytes / (1024 * 1024)).toFixed(2),
  };
}

export function vacuum() {
  const db = getDb();
  db.exec('VACUUM');
}

export function getTableCounts() {
  const db = getDb();
  return {
    users: db.prepare('SELECT COUNT(*) as count FROM users').get().count,
    sites: db.prepare('SELECT COUNT(*) as count FROM sites').get().count,
    sessions: db.prepare('SELECT COUNT(*) as count FROM sessions').get().count,
    page_views: db.prepare('SELECT COUNT(*) as count FROM page_views').get().count,
    conversions: db.prepare('SELECT COUNT(*) as count FROM conversions').get().count,
    daily_stats: db.prepare('SELECT COUNT(*) as count FROM daily_stats').get().count,
  };
}
