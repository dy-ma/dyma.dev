import type { APIRoute } from 'astro';
import {
  createVisitorCookie,
  readVisitorCookie,
  VISITOR_COOKIE_MAX_AGE,
  VISITOR_COOKIE_NAME,
} from '@/lib/visitor-cookie';

export const prerender = false;

const DAY = 1000 * 60 * 60 * 24;
const LOCAL_API_ORIGIN = 'http://127.0.0.1:8787';
const LOCAL_API_SECRET = 'local-development-secret';

type VisitResponse = {
  visitorNumber: number;
  total: number;
  currentVisitors: number;
  returning: boolean;
};

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

function previewResponse() {
  return Response.json(
    {
      visitorNumber: 19,
      total: 19,
      currentVisitors: 1,
      returning: true,
      lastVisitDays: 0,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export const GET: APIRoute = async ({ request }) => {
  if (process.env.VERCEL_ENV === 'preview') {
    return previewResponse();
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const apiOrigin =
    process.env.VISITOR_API_URL || (isProduction ? null : LOCAL_API_ORIGIN);
  const apiSecret =
    process.env.VISITOR_API_SECRET || (isProduction ? null : LOCAL_API_SECRET);
  const cookieSecret =
    process.env.VISITOR_COOKIE_SECRET ||
    (isProduction ? null : LOCAL_API_SECRET);

  if (!apiOrigin || !apiSecret || !cookieSecret) {
    return new Response('Visitor counter is not configured', { status: 503 });
  }

  const now = Date.now();
  const existing = await readVisitorCookie(readCookie(request), cookieSecret);

  let visitorResponse: Response;
  try {
    visitorResponse = await fetch(
      `${apiOrigin.replace(/\/$/, '')}/api/visitor`,
      {
        method: 'POST',
        body: JSON.stringify({ visitorNumber: existing?.visitorNumber ?? null }),
        headers: {
          Authorization: `Bearer ${apiSecret}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5_000),
      },
    );
  } catch {
    return new Response('Visitor counter unavailable', { status: 502 });
  }

  if (!visitorResponse.ok) {
    return new Response('Visitor counter unavailable', { status: 502 });
  }

  const { visitorNumber, total, currentVisitors, returning } =
    (await visitorResponse.json()) as VisitResponse;
  const token = await createVisitorCookie(visitorNumber, now, cookieSecret);
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
