import { execSync, spawn } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { DENO, ROOT, denoBuild, evidence } from './helpers.ts';

const p = (rel: string) => `${ROOT}${rel}`;
const SMOKE_PORT = Number(process.env.PORT ?? 4129) + 1;

test('adapt.mjs produces Vercel, Netlify, Cloudflare and Deno outputs', async () => {
  const notes: string[] = [];

  // Vercel: Build Output API v3.
  rmSync(p('.vercel/output'), { recursive: true, force: true });
  let secs = denoBuild({ VERCEL: '1' });
  for (const f of ['.vercel/output/config.json', '.vercel/output/functions/index.func/index.mjs', '.vercel/output/functions/index.func/.vc-config.json']) {
    expect(existsSync(p(f)), f).toBe(true);
  }
  expect(JSON.parse(readFileSync(p('.vercel/output/functions/index.func/.vc-config.json'), 'utf8')).runtime).toMatch(/^nodejs/);
  // Smoke: run the Node function locally and render a page.
  const fn = spawn('node', ['-e', `import('${p('.vercel/output/functions/index.func/index.mjs')}').then(m=>require('node:http').createServer(m.default).listen(${SMOKE_PORT}))`], { stdio: 'ignore' });
  try {
    let status = 0;
    await expect.poll(async () => {
      status = await fetch(`http://localhost:${SMOKE_PORT}/feature-tests`).then((r) => r.status).catch(() => 0);
      return status;
    }, { timeout: 20_000 }).toBe(200);
    notes.push(`vercel (${secs}s): .vercel/output + Node function served /feature-tests 200`);
  } finally {
    fn.kill();
  }

  // Netlify: edge function bundle.
  rmSync(p('netlify/edge-functions'), { recursive: true, force: true });
  secs = denoBuild({ NETLIFY: '1' });
  expect(existsSync(p('netlify/edge-functions/fresh.js'))).toBe(true);
  expect(existsSync(p('_fresh/client/_headers'))).toBe(true);
  const netlifyStatus = execSync(
    `${DENO} eval "const m = await import('${p('netlify/edge-functions/fresh.js')}'); const r = await m.default(new Request('http://x/feature-tests')); console.log(String(r.status))"`,
    { cwd: ROOT, encoding: 'utf8' },
  ).trim().split('\n').pop();
  expect(netlifyStatus).toBe('200');
  notes.push(`netlify (${secs}s): netlify/edge-functions/fresh.js rendered /feature-tests 200`);

  // Cloudflare: wrangler bundles cloudflare/worker.js; check it bundles for workerd.
  secs = denoBuild({ CLOUDFLARE: '1' });
  expect(existsSync(p('_fresh/client/_headers'))).toBe(true);
  const out = p('feature-tests/.out/cf-worker.js');
  execSync(
    `${DENO} run -A npm:esbuild@0.25.12 cloudflare/worker.js --bundle --format=esm --platform=neutral --conditions=workerd,worker,browser --main-fields=module,main --external:node:* --log-level=error --outfile=${out}`,
    { cwd: ROOT, stdio: 'pipe' },
  );
  expect(existsSync(out)).toBe(true);
  notes.push(`cloudflare (${secs}s): _fresh/client/_headers + cloudflare/worker.js bundles for workerd (not deployed)`);

  // Deno (default, no flag).
  secs = denoBuild();
  expect(existsSync(p('_fresh/server.js'))).toBe(true);
  expect(readFileSync(p('_fresh/server/server-entry.mjs'), 'utf8')).not.toContain('/var/task/_fresh/server');
  notes.push(`deno (${secs}s): _fresh/server.js`);

  evidence(notes.join('; '));
});
