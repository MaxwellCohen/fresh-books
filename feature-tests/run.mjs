// Builds, serves and tests every feature, then writes feature-tests/results.json.
// Order: build-time specs (they run their own builds) → clean production build → runtime specs.
import { execSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
process.env.PORT ??= '4129';

function findDeno() {
  if (process.env.FT_DENO) return process.env.FT_DENO;
  if (spawnSync('deno', ['--version']).status === 0) return 'deno';
  const local = join(homedir(), '.deno-npm/node_modules/@deno/linux-x64-glibc/deno');
  if (existsSync(local)) return local;
  return 'npx --yes deno@2.9.6';
}
process.env.FT_DENO = findDeno();
console.log(`deno: ${process.env.FT_DENO}`);
mkdirSync(join(here, '.out'), { recursive: true });

const pw = (phase) =>
  spawnSync('npx', ['playwright', 'test'], { cwd: here, stdio: 'inherit', env: { ...process.env, FT_PHASE: phase } });

pw('build');
console.log('\n> production build');
execSync(`${process.env.FT_DENO} task build`, { cwd: root, stdio: 'inherit' });
pw('runtime');

const META = {
  'css-inlining': ['manual', "Vite `?inline` CSS import rendered into <style> via Fresh <Head> (query preserved by a small resolveId plugin in vite.config.ts)"],
  'font-optimization': ['third-party', '@fontsource-variable/geist imported in global.css (self-hosted, font-display: swap) + hand-written <link rel=preload as=font> using a Vite ?url import'],
  'image-pipeline': ['third-party', 'vite-imagetools: sample.jpg?w=400;800;1200&format=webp&as=srcset, explicit width/height, loading=lazy'],
  caching: ['manual', "the port's withTtlCache (memory Map + host store, 1h TTL, in-flight de-dup) around a timestamp loader"],
  'route-prefetching': ['manual', '<script type="speculationrules"> prefetch, eagerness moderate (hover), links outside f-client-nav'],
  islands: ['first-party', 'islands/FtCounter.tsx island next to a server-only components/feature-tests/static-panel.tsx'],
  'render-modes': ['manual', 'routes/feature-tests/render-modes/_middleware.ts: per-route Cache-Control (s-maxage / swr / no-store) + in-process HTML cache'],
  reactivity: ['first-party', '@preact/signals useSignal passed directly into JSX inside an island'],
  'bundle-analysis': ['third-party', 'rollup-plugin-visualizer added to vite.config.ts when ANALYZE=1'],
  'third-party-scripts': ['manual', 'inline <head> snippet injects an async <script> at requestIdleCallback after load'],
  'multi-host-deployment': ['manual', 'scripts/adapt.mjs post-build wrappers: VERCEL=1 / NETLIFY=1 / CLOUDFLARE=1 / default Deno'],
};

const results = {};
for (const phase of ['build', 'runtime']) {
  const file = join(here, '.out', `${phase}.json`);
  if (!existsSync(file)) continue;
  const report = JSON.parse(readFileSync(file, 'utf8'));
  const walk = (suite) => {
    for (const s of suite.suites ?? []) walk(s);
    for (const spec of suite.specs ?? []) {
      const id = spec.file.replace(/\.spec\.ts$/, '').split('/').pop();
      const t = spec.tests[0];
      const r = t.results.at(-1);
      const ev = [...(t.annotations ?? []), ...(r?.annotations ?? [])].find((a) => a.type === 'evidence');
      const err = r?.error?.message?.replace(/\u001b\[[0-9;]*m/g, '').split('\n').filter((l) => l.trim()).slice(0, 4).join(' | ') ?? '';
      results[id] = {
        claimedLabel: META[id]?.[0],
        status: r?.status === 'passed' ? 'pass' : 'fail',
        method: META[id]?.[1],
        evidence: r?.status === 'passed' ? ev?.description ?? '' : `FAILED: ${err}`,
        test: `feature-tests/${id}.spec.ts`,
      };
    }
  };
  walk(report);
}
for (const id of Object.keys(META)) {
  results[id] ??= { claimedLabel: META[id][0], status: 'blocked', method: META[id][1], evidence: 'spec did not run', test: `feature-tests/${id}.spec.ts` };
}

const ordered = Object.fromEntries(Object.keys(META).map((id) => [id, results[id]]));
const commit = execSync('git rev-parse HEAD', { cwd: root, encoding: 'utf8' }).trim();
const out = { framework: 'fresh', repo: 'fresh-books', commit, ranAt: new Date().toISOString(), results: ordered };
writeFileSync(join(here, 'results.json'), JSON.stringify(out, null, 2) + '\n');
console.log('\nresults:', Object.entries(ordered).map(([k, v]) => `${k}=${v.status}`).join(' '));
