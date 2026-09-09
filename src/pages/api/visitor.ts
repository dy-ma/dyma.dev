import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import {
  createVisitorCookie,
  readVisitorCookie,
  VISITOR_COOKIE_MAX_AGE,
  VISITOR_COOKIE_NAME,
} from '@/lib/visitor-cookie';
import type { VisitorEnv } from '@/worker/visitor-counter';

export const prerender = false;

const DAY = 1000 * 60 * 60 * 24;
const VISITOR_DO_ID = 'global';

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

export const GET: APIRoute = async ({ request }) => {
  const visitorEnv = env as unknown as VisitorEnv;
  const secret =
    visitorEnv.VISITOR_COOKIE_SECRET ||
    'local-preview-secret-change-in-production';
  const now = Date.now();
  const existing = await readVisitorCookie(readCookie(request), secret);
  const visitorResponse = await visitorEnv.VISITOR_COUNTER_DO.getByName(
    VISITOR_DO_ID,
  ).fetch(
    new Request('http://local.visitor-counter-do/api/visitor', {
      method: 'POST',
      body: JSON.stringify({ visitorNumber: existing?.visitorNumber ?? null }),
      headers: { 'Content-Type': 'application/json' },
    }),
  );

  if (!visitorResponse.ok) {
    return new Response('Visitor counter unavailable', { status: 502 });
  }

  const { visitorNumber, total, currentVisitors, returning } =
    (await visitorResponse.json()) as {
      visitorNumber: number;
      total: number;
      currentVisitors: number;
      returning: boolean;
    };
  const token = await createVisitorCookie(visitorNumber, now, secret);
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  const response = Response.json({
    visitorNumber,
    total,
    currentVisitors: Math.max(1, currentVisitors),
    returning,
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
};
