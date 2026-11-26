import { expect, test } from '@playwright/test';
import { evidence } from './helpers.ts';

test('signal updates bound text without re-running the component', async ({ page }) => {
  await page.goto('/feature-tests/reactivity');
  await page.waitForFunction(() => (window as unknown as { __ftRenders?: number }).__ftRenders === 1);
  for (let i = 0; i < 3; i++) await page.click('#ft-signal-inc');
  await expect(page.locator('#ft-signal-count')).toHaveText('3');
  const renders = await page.evaluate(() => (window as unknown as { __ftRenders: number }).__ftRenders);
  expect(renders).toBe(1);
  await expect(page.locator('#ft-signal-renders')).toHaveText('1');
  evidence('3 clicks → text "3"; component render counter stayed at 1 (useSignal passed directly into JSX binds the text node)');
});
