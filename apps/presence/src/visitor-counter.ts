import { DurableObject } from 'cloudflare:workers';

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

export type VisitorEnv = {
  VISITOR_API_SECRET?: string;
  VISITOR_COUNTER_DO: DurableObjectNamespace<VisitorCounterDurableObject>;
};

function sanitizeVisitorNumber(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value <= 0) {
    return null;
  }
  return value;
}

export class VisitorCounterDurableObject extends DurableObject<VisitorEnv> {
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
      (await this.ctx.storage.get<number>(TOTAL_VISITORS_KEY)) ?? 0;
    const now = Date.now();
    const threshold = now - ACTIVE_VISITOR_TTL_MS;
    const activeVisitorEntries = await this.ctx.storage.list<{
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
      await this.ctx.storage.delete(staleKeys);
    }

    let visitorNumber: number;
    let total = previousTotal;
    let returning = false;

    if (existingVisitorNumber === null) {
      visitorNumber = previousTotal + 1;
      total = visitorNumber;
    } else {
      visitorNumber = existingVisitorNumber;
      returning = true;
      total = Math.max(total, existingVisitorNumber);
    }

    const activeVisitorKey = ACTIVE_VISITOR_PREFIX + String(visitorNumber);
    const currentVisitors = Math.max(
      1,
      activeVisitorKeys.size +
        (activeVisitorKeys.has(activeVisitorKey) ? 0 : 1),
    );
    await this.ctx.storage.put(activeVisitorKey, { lastSeen: now });
    await this.ctx.storage.put(TOTAL_VISITORS_KEY, total);

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
