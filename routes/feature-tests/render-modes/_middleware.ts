import { define } from '../../../utils.ts';

// Manual render modes. Fresh renders every route on the server; we choose a mode per route by
// (1) a CDN Cache-Control header and (2) an in-process HTML cache that stands in for a CDN locally.
const MODES: Record<string, { cacheControl: string; ttlMs: number }> = {
  '/feature-tests/render-modes/static': { cacheControl: 'public, max-age=0, s-maxage=31536000', ttlMs: Infinity },
  '/feature-tests/render-modes/isr': { cacheControl: 'public, max-age=0, s-maxage=3, stale-while-revalidate=86400', ttlMs: 3000 },
  '/feature-tests/render-modes/ssr': { cacheControl: 'private, no-store', ttlMs: 0 },
};

const html = new Map<string, { body: string; headers: [string, string][]; expiresAt: number }>();

export const handler = define.middleware(async (ctx) => {
  const mode = MODES[ctx.url.pathname];
  if (!mode) return ctx.next();
  const hit = html.get(ctx.url.pathname);
  if (hit && hit.expiresAt > Date.now()) {
    const headers = new Headers(hit.headers);
    headers.set('X-Render-Cache', 'HIT');
    return new Response(hit.body, { headers });
  }
  const res = await ctx.next();
  const body = await res.text();
  const headers = new Headers(res.headers);
  headers.set('Cache-Control', mode.cacheControl);
  headers.set('X-Render-Cache', 'MISS');
  if (mode.ttlMs > 0) html.set(ctx.url.pathname, { body, headers: [...headers], expiresAt: Date.now() + mode.ttlMs });
  return new Response(body, { status: res.status, headers });
});
