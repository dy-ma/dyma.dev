import { env } from 'cloudflare:workers';

const COOKIE_NAME = 'dylan_visitor';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 400;
const DAY = 1000 * 60 * 60 * 24;

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

async function signature(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signed = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(value),
  );
  return bytesToBase64Url(new Uint8Array(signed));
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function readCookie(request: Request) {
  const header = request.headers.get('cookie') ?? '';
  const cookie = header
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));
  return cookie
    ? decodeURIComponent(cookie.slice(COOKIE_NAME.length + 1))
    : null;
}

async function readVisitor(request: Request, secret: string) {
  const cookie = readCookie(request);
  if (!cookie) return null;
  const [number, lastVisit, suppliedSignature] = cookie.split('.');
  if (!number || !lastVisit || !suppliedSignature) return null;

  const expectedSignature = await signature(`${number}.${lastVisit}`, secret);
  if (!constantTimeEqual(expectedSignature, suppliedSignature)) return null;

  const visitorNumber = Number(number);
  const lastVisitAt = Number(lastVisit);
  if (
    !Number.isSafeInteger(visitorNumber) ||
    !Number.isSafeInteger(lastVisitAt)
  )
    return null;
  return { visitorNumber, lastVisitAt };
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
  const existing = await readVisitor(request, secret);
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

  const payload = `${visitorNumber}.${now}`;
  const token = `${payload}.${await signature(payload, secret)}`;
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
    `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; SameSite=Lax${secure}`,
  );
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
