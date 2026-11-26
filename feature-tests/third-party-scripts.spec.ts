import { expect, test } from '@playwright/test';
import { evidence } from './helpers.ts';

test('stand-in vendor script loads at idle after first render', async ({ page, request }) => {
  const html = await (await request.get('/feature-tests/third-party-scripts')).text();
  const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? '';
  expect(head).not.toMatch(/<script[^>]*src="[^"]*fake-3p\.js/);

  await page.goto('/feature-tests/third-party-scripts');
  await expect(page.locator('#ft-3p-content')).toBeVisible();
  await page.waitForFunction(() => (window as unknown as { __fake3p?: unknown }).__fake3p !== undefined, null, { timeout: 15_000 });
  const info = await page.evaluate(() => {
    const ran = (window as unknown as { __fake3p: { ranAt: number; readyState: string } }).__fake3p;
    const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null;
    const s = document.getElementById('ft-3p') as HTMLScriptElement | null;
    return { ...ran, fcp, async: s?.async ?? null };
  });
  expect(info.readyState).toBe('complete');
  expect(info.async).toBe(true);
  if (info.fcp !== null) expect(info.ranAt).toBeGreaterThan(info.fcp);
  evidence(`no <script src> for the vendor file in server HTML; injected async at idle after load, ran at ${info.ranAt.toFixed(0)}ms (readyState=${info.readyState}, FCP ${info.fcp?.toFixed(0) ?? 'n/a'}ms)`);
});
