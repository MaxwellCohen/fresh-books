import { expect, test } from '@playwright/test';
import { evidence, stylesheetHrefs } from './helpers.ts';

test('Fontsource font is self-hosted, font-display set, preloaded', async ({ page, request, baseURL }) => {
  const requests: string[] = [];
  page.on('request', (r) => requests.push(r.url()));
  await page.goto('/feature-tests/font-optimization');
  const loaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family);
  });

  expect(requests.filter((u) => /fonts\.(googleapis|gstatic)\.com/.test(u))).toEqual([]);

  const preload = page.locator('link[rel="preload"][as="font"]');
  await expect(preload).toHaveCount(1);
  const preloadHref = (await preload.getAttribute('href'))!;
  expect(preloadHref).toMatch(/^\/assets\/geist-latin-wght-normal-.*\.woff2$/);

  const html = await page.content();
  const css = (await Promise.all(stylesheetHrefs(html).map(async (h) => (await request.get(h)).text()))).join('\n');
  const faces = css.match(/@font-face\{[^}]*\}/g) ?? [];
  const geistFaces = faces.filter((f) => f.includes('Geist Variable'));
  expect(geistFaces.length).toBeGreaterThan(0);
  for (const f of geistFaces) expect(f).toMatch(/font-display:\s*swap/);
  expect(css).toContain(preloadHref);

  const font = await request.get(preloadHref);
  expect(font.status()).toBe(200);
  expect(font.headers()['content-type']).toContain('font/woff2');
  expect(requests.some((u) => u.startsWith(`${baseURL}${preloadHref}`))).toBe(true);
  expect(loaded).toContain('Geist Variable');

  evidence(`0 Google Fonts requests; ${geistFaces.length} Geist @font-face rules all font-display:swap; <link rel=preload as=font> ${preloadHref} matches the @font-face src and is served same-origin as font/woff2; document.fonts loaded 'Geist Variable'`);
});
