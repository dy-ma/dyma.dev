declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    VISITOR_COOKIE_SECRET?: string;
  }
}
