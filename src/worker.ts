import { handle } from '@astrojs/cloudflare/handler';
import type { VisitorEnv } from '@/worker/visitor-counter';

export { VisitorCounterDurableObject } from '@/worker/visitor-counter';

export default {
  fetch(request, env, context) {
    return handle(request, env as Env, context);
  },
} satisfies ExportedHandler<VisitorEnv>;
