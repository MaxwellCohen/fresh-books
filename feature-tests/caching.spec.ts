import { expect, test } from '@playwright/test';
import { evidence } from './helpers.ts';

async function read(request: import('@playwright/test').APIRequestContext, gen: string) {
  const html = await (await request.get(`/feature-tests/caching?gen=${gen}`)).text();
  const pick = (id: string) => html.match(new RegExp(`id="${id}">([^<]*)<`))?.[1];
  return { stamp: pick('ft-cache-stamp'), load: Number(pick('ft-cache-load')) };
}

test('withTtlCache returns the cached value within TTL and de-dupes in-flight loads', async ({ request }) => {
  const gen = `run-${Date.now()}`;
  // Concurrent first requests share one in-flight load.
  const [a, b] = await Promise.all([read(request, gen), read(request, gen)]);
  expect(a).toEqual(b);
  await new Promise((r) => setTimeout(r, 1200));
  const c = await read(request, gen);
  expect(c).toEqual(a);

  // Revalidate by changing the cache key: a fresh load runs.
  const fresh = await read(request, `${gen}-next`);
  expect(fresh.stamp).not.toBe(a.stamp);
  expect(fresh.load).toBe(a.load + 1);

  evidence(`2 concurrent + 1 later request (1.2s) all got stamp ${a.stamp} / load #${a.load}; new key → load #${fresh.load} with a new stamp. TTL expiry (1h) not waited for`);
});
