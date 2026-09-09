import { env } from 'cloudflare:workers';
import {
  createVisitorCookie,
  readVisitorCookie,
  VISITOR_COOKIE_MAX_AGE,
  VISITOR_COOKIE_NAME,
} from '@/lib/visitor-cookie';

const DAY = 1000 * 60 * 60 * 24;
const VISITOR_DO_ID = 'global';

const ACTIVE_VISITOR_PREFIX = 'active-visitor:';
const ACTIVE_VISITOR_TTL_MS = 60_000;
const TOTAL_VISITORS_KEY = 'total-visitors';

type VisitRequest = {
  visitorNumber?: number | null;
};

type VisitResponse = {
  visitorNumber: number;
  total: number;
  currentVisitors: number;
  returning: boolean;
};

type VisitorEnv = {
  VISITOR_COOKIE_SECRET?: string;
  VISITOR_COUNTER_DO: DurableObjectNamespace;
};

function sanitizeVisitorNumber(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value <= 0)
    return null;
  return value;
}

export class VisitorCounterDurableObject {
  private readonly state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    if (new URL(request.url).pathname !== '/api/visitor') {
      return new Response('Not Found', { status: 404 });
    }
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: { Allow: 'POST' },
      });
    }

    const { visitorNumber: incomingVisitorNumber } = (await request
      .json()
      .catch(() => ({}))) as VisitRequest;
    const existingVisitorNumber = sanitizeVisitorNumber(incomingVisitorNumber);

    const previousTotal =
      (await this.state.storage.get<number>(TOTAL_VISITORS_KEY)) ?? 0;
    const now = Date.now();
    const threshold = now - ACTIVE_VISITOR_TTL_MS;

    const activeVisitorEntries = await this.state.storage.list<{
      lastSeen: number;
    }>({ prefix: ACTIVE_VISITOR_PREFIX });

    const staleKeys: string[] = [];
    const activeVisitorKeys = new Set<string>();
    for (const [key, value] of activeVisitorEntries) {
      if (
        !value ||
        typeof value.lastSeen !== 'number' ||
        value.lastSeen < threshold
      ) {
        staleKeys.push(key);
      } else {
        activeVisitorKeys.add(key);
      }
    }

    if (staleKeys.length > 0) {
      await this.state.storage.delete(staleKeys);
    }

    let visitorNumber: number;
    let total = previousTotal;
    let returning = false;

    if (existingVisitorNumber === null) {
      visitorNumber = previousTotal + 1;
      total = visitorNumber;
      returning = false;
    } else {
      visitorNumber = existingVisitorNumber;
      returning = true;
      if (existingVisitorNumber > total) {
        total = existingVisitorNumber;
      }
    }

    const activeVisitorKey = ACTIVE_VISITOR_PREFIX + String(visitorNumber);
    const currentVisitors = Math.max(
      1,
      activeVisitorKeys.size +
        (activeVisitorKeys.has(activeVisitorKey) ? 0 : 1),
    );
    await this.state.storage.put(activeVisitorKey, {
      lastSeen: now,
    });
    await this.state.storage.put(TOTAL_VISITORS_KEY, total);

    const response: VisitResponse = {
      visitorNumber,
      total,
      currentVisitors,
      returning,
    };
    return Response.json(response, {
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}

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

export async function GET(request: Request) {
  const visitorEnv = env as unknown as VisitorEnv;
  const secret =
    visitorEnv.VISITOR_COOKIE_SECRET ||
    'local-preview-secret-change-in-production';
  const now = Date.now();
  const existing = await readVisitorCookie(readCookie(request), secret);
  const visitorResponse = await visitorEnv.VISITOR_COUNTER_DO.get(
    visitorEnv.VISITOR_COUNTER_DO.idFromName(VISITOR_DO_ID),
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
  const {
    visitorNumber,
    total,
    currentVisitors,
    returning: doReturning,
  } = (await visitorResponse.json()) as {
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
    currentVisitors,
    returning: doReturning,
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
