import { expect, test } from '@playwright/test';
import { evidence } from './helpers.ts';

test('vite-imagetools: srcset widths, dimensions, lazy offscreen, WebP output', async ({ page, request }) => {
  const imgRequests: string[] = [];
  page.on('request', (r) => { if (r.resourceType() === 'image') imgRequests.push(r.url()); });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/feature-tests/image-pipeline');
  const hero = page.locator('#ft-img-hero');
  const off = page.locator('#ft-img-offscreen');

  const srcset = (await hero.getAttribute('srcset'))!;
  const candidates = srcset.split(',').map((s) => s.trim().split(/\s+/));
  const widths = candidates.map(([, w]) => w);
  expect(new Set(widths).size).toBeGreaterThanOrEqual(2);
  expect(await hero.getAttribute('width')).toBe('800');
  expect(await hero.getAttribute('height')).toBe('500');
  expect(await off.getAttribute('loading')).toBe('lazy');

  // Lazy: the offscreen image has not loaded until it is scrolled into view.
  await expect.poll(() => hero.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  await page.waitForTimeout(500);
  const offUrls = (await off.getAttribute('srcset'))!.split(',').map((s) => s.trim().split(/\s+/)[0]);
  const isOff = (u: string) => offUrls.some((o) => u.endsWith(o));
  expect(imgRequests.filter(isOff), 'offscreen image not requested before scroll').toEqual([]);
  expect(await off.evaluate((i: HTMLImageElement) => i.currentSrc)).toBe('');
  await off.scrollIntoViewIfNeeded();
  await expect.poll(() => off.evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(0);
  expect(imgRequests.filter(isOff).length).toBeGreaterThan(0);

  const types: string[] = [];
  for (const [url] of candidates) {
    const res = await request.get(url);
    expect(res.status()).toBe(200);
    types.push(res.headers()['content-type']);
    expect(res.headers()['content-type']).toMatch(/image\/(webp|avif)/);
  }
  evidence(`srcset widths ${widths.join(',')} from a 1600px JPEG; width/height 800x500; offscreen loading=lazy (its srcset URLs not requested until scrolled into view); srcset URLs serve ${[...new Set(types)].join(',')}`);
});
