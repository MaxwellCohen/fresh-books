import { existsSync, readFileSync, rmSync, statSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { ROOT, denoBuild, evidence } from './helpers.ts';

test('ANALYZE=1 build writes rollup-plugin-visualizer reports', async () => {
  const dir = `${ROOT}feature-tests/.out`;
  const client = `${dir}/stats-client.html`;
  const ssr = `${dir}/stats-ssr.html`;
  rmSync(client, { force: true });
  rmSync(ssr, { force: true });
  const secs = denoBuild({ ANALYZE: '1', ANALYZE_DIR: dir });
  for (const f of [client, ssr]) {
    expect(existsSync(f), f).toBe(true);
    expect(readFileSync(f, 'utf8')).toContain('<title>Rollup Visualizer</title>');
  }
  const html = readFileSync(client, 'utf8');
  expect(html).toContain('FtCounter');
  const kb = (f: string) => Math.round(statSync(f).size / 1024);
  evidence(`ANALYZE=1 deno task build (${secs}s) wrote Rollup Visualizer treemaps .out/stats-client.html (${kb(client)} KB, lists island chunks) and .out/stats-ssr.html (${kb(ssr)} KB)`);
});
