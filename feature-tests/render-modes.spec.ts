import { expect, test } from '@playwright/test';
import { evidence } from './helpers.ts';

async function get(request: import('@playwright/test').APIRequestContext, mode: string) {
  const res = await request.get(`/feature-tests/render-modes/${mode}`);
  const html = await res.text();
  return {
    at: html.match(/id="ft-rendered-at">([^<]*)</)?.[1],
    cc: res.headers()['cache-control'],
    hit: res.headers()['x-render-cache'],
  };
}

test('static, ISR and SSR modes on different routes', async ({ request }) => {
  const s1 = await get(request, 'static');
  const s2 = await get(request, 'static');
  expect(s2.at).toBe(s1.at);
  expect(s1.cc).toContain('s-maxage=31536000');

  const r1 = await get(request, 'ssr');
  await new Promise((r) => setTimeout(r, 20));
  const r2 = await get(request, 'ssr');
  expect(r2.at).not.toBe(r1.at);
  expect(r1.cc).toContain('no-store');

  const i1 = await get(request, 'isr');
  const i2 = await get(request, 'isr');
  expect(i2.at).toBe(i1.at);
  expect(i1.cc).toContain('stale-while-revalidate');
  await new Promise((r) => setTimeout(r, 3500));
  const i3 = await get(request, 'isr');
  expect(i3.at).not.toBe(i1.at);

  evidence(`static: same timestamp twice, "${s1.cc}"; isr: same within 3s then re-rendered after 3.5s, "${i1.cc}"; ssr: new timestamp each request, "${r1.cc}". No build-time prerender: "static" is rendered on first request and held in memory`);
});
