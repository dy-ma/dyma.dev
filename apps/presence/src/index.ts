import type { VisitorEnv } from './visitor-counter';

export { VisitorCounterDurableObject } from './visitor-counter';

const VISITOR_DO_ID = 'global';

function isAuthorized(request: Request, env: VisitorEnv) {
  if (!env.VISITOR_API_SECRET) {
    return false;
  }

  return request.headers.get('authorization') === `Bearer ${env.VISITOR_API_SECRET}`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return Response.json({ ok: true });
    }

    if (url.pathname !== '/api/visitor') {
      return new Response('Not Found', { status: 404 });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: { Allow: 'POST' },
      });
    }

    if (!isAuthorized(request, env)) {
      return new Response('Unauthorized', { status: 401 });
    }

    return env.VISITOR_COUNTER_DO.getByName(VISITOR_DO_ID).fetch(request);
  },
} satisfies ExportedHandler<VisitorEnv>;
