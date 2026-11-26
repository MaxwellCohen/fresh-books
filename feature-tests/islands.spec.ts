import { expect, test } from '@playwright/test';
import { evidence } from './helpers.ts';

const MARKER = 'FT_STATIC_ONLY_MARKER_k9p2';

test('island hydrates; static component code is not shipped', async ({ page }) => {
  const scripts: { url: string; body: string }[] = [];
  page.on('response', async (res) => {
    const type = res.request().resourceType();
    if (type === 'script' || res.url().endsWith('.js') || res.url().includes('.js?')) {
      scripts.push({ url: res.url(), body: await res.text().catch(() => '') });
    }
  });
  await page.goto('/feature-tests/islands');
  await expect(page.locator('#ft-static-panel')).toContainText(MARKER);
  await page.click('#ft-island-inc');
  await page.click('#ft-island-inc');
  await expect(page.locator('#ft-island-count')).toHaveText('2');
  await page.waitForLoadState('networkidle');

  const islandChunk = scripts.find((s) => s.url.includes('fresh-island__FtCounter'));
  expect(islandChunk, 'island chunk requested').toBeTruthy();
  const leaking = scripts.filter((s) => s.body.includes(MARKER) || s.body.includes('StaticPanel'));
  expect(leaking.map((s) => s.url)).toEqual([]);
  const inline = await page.evaluate(() => [...document.scripts].filter((s) => !s.src).map((s) => s.textContent ?? '').join('\n'));
  expect(inline).not.toContain('StaticPanel');

  evidence(`counter island hydrated (2 clicks → 2); ${scripts.length} JS files loaded incl. ${islandChunk!.url.split('/').pop()?.split('?')[0]}; none contain the static marker or StaticPanel`);
});
