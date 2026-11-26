import { expect, test } from '@playwright/test';
import { evidence } from './helpers.ts';

test('hovering a link prefetches the target document before the click', async ({ page, request }) => {
  await request.delete('/feature-tests/route-prefetching/log');
  const seen: { url: string; purpose?: string }[] = [];
  page.on('request', (r) => {
    if (r.url().includes('/feature-tests/route-prefetching/target')) {
      seen.push({ url: r.url(), purpose: r.headers()['sec-purpose'] });
    }
  });

  await page.goto('/feature-tests/route-prefetching');
  expect(await page.locator('script[type="speculationrules"]').count()).toBe(1);
  await page.waitForTimeout(500);
  const before = (await (await request.get('/feature-tests/route-prefetching/log')).json()) as unknown[];
  expect(before).toEqual([]);

  await page.hover('#ft-prefetch-link');
  let serverLog: { secPurpose: string | null }[] = [];
  await expect.poll(async () => {
    serverLog = await (await request.get('/feature-tests/route-prefetching/log')).json();
    return serverLog.length + seen.length;
  }, { timeout: 10_000 }).toBeGreaterThan(0);

  const prefetchServer = serverLog.filter((r) => r.secPurpose?.includes('prefetch'));
  expect(prefetchServer.length + seen.length).toBeGreaterThan(0);

  await page.click('#ft-prefetch-link');
  await expect(page.locator('#ft-prefetch-target')).toBeVisible();
  evidence(`before click: page.on('request') saw ${seen.length} request(s) to target${seen[0]?.purpose ? ` (Sec-Purpose: ${seen[0].purpose})` : ''}; server logged ${serverLog.length} hit(s), Sec-Purpose=${serverLog.map((r) => r.secPurpose).join(',')}`);
});
