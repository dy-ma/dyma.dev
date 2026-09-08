import { env } from 'cloudflare:workers';
import {
  createVisitorCookie,
  readVisitorCookie,
  VISITOR_COOKIE_MAX_AGE,
  VISITOR_COOKIE_NAME,
} from '@/lib/visitor-cookie';

const DAY = 1000 * 60 * 60 * 24;

function readCookie(request: Request) {
  const header = request.headers.get('cookie') ?? '';
  const cookie = header
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${VISITOR_COOKIE_NAME}=`));
  return cookie
    ? decodeURIComponent(cookie.slice(VISITOR_COOKIE_NAME.length + 1))
    : null;
}

async function ensureCounter() {
  await env.DB.prepare(
    'CREATE TABLE IF NOT EXISTS site_stats (key TEXT PRIMARY KEY NOT NULL, value INTEGER NOT NULL, updated_at INTEGER NOT NULL)',
  ).run();
}

export async function GET(request: Request) {
  await ensureCounter();

  const secret =
    env.VISITOR_COOKIE_SECRET || 'local-preview-secret-change-in-production';
  const now = Date.now();
  const existing = await readVisitorCookie(readCookie(request), secret);
  let visitorNumber: number;
  let total: number;

  if (existing) {
    visitorNumber = existing.visitorNumber;
    const current = await env.DB.prepare(
      "SELECT value FROM site_stats WHERE key = 'visitors'",
    ).first<{
      value: number;
    }>();
    total = Math.max(current?.value ?? visitorNumber, visitorNumber);
  } else {
    const next = await env.DB.prepare(
      "INSERT INTO site_stats (key, value, updated_at) VALUES ('visitors', 1, ?) ON CONFLICT(key) DO UPDATE SET value = value + 1, updated_at = excluded.updated_at RETURNING value",
    )
      .bind(now)
      .first<{ value: number }>();
    visitorNumber = next?.value ?? 1;
    total = visitorNumber;
  }

  const token = await createVisitorCookie(visitorNumber, now, secret);
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  const response = Response.json({
    visitorNumber,
    total,
    returning: Boolean(existing),
    lastVisitDays: existing
      ? Math.max(0, Math.floor((now - existing.lastVisitAt) / DAY))
      : null,
  });
  response.headers.append(
    'Set-Cookie',
    `${VISITOR_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${VISITOR_COOKIE_MAX_AGE}; HttpOnly; SameSite=Lax${secure}`,
  );
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
