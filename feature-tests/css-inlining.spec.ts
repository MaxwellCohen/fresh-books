import { expect, test } from '@playwright/test';
import { evidence, stylesheetHrefs } from './helpers.ts';

const MARKER = 'ft-inline-marker-q7z';

test('route CSS is inlined in <style>, not linked', async ({ page, request }) => {
  const html = await (await request.get('/feature-tests/css-inlining')).text();
  const style = html.match(/<style id="ft-inline-style"[^>]*>([\s\S]*?)<\/style>/)?.[1] ?? '';
  expect(style).toContain(`.${MARKER}`);

  const hrefs = stylesheetHrefs(html);
  for (const href of hrefs) {
    const css = await (await request.get(href)).text();
    expect(css, `stylesheet ${href} must not carry the route CSS`).not.toContain(MARKER);
  }

  await page.goto('/feature-tests/css-inlining');
  await expect(page.locator('#ft-inline-box')).toHaveCSS('border-top-color', 'rgb(200, 30, 90)');
  evidence(`inline <style> has .${MARKER} (${style.length} chars); ${hrefs.length} <link rel=stylesheet> (global Tailwind CSS) and none contains the marker; style applied in browser`);
});
