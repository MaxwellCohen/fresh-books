import { execSync } from 'node:child_process';
import { test } from '@playwright/test';

export const ROOT = new URL('..', import.meta.url).pathname;
export const DENO = process.env.FT_DENO ?? 'deno';

/** One-line evidence string, collected into results.json by run.mjs. */
export function evidence(text: string) {
  test.info().annotations.push({ type: 'evidence', description: text });
}

export function denoBuild(env: Record<string, string> = {}) {
  const clean = { ...process.env };
  for (const k of ['VERCEL', 'NETLIFY', 'CLOUDFLARE', 'WORKERS_CI', 'ANALYZE', 'ANALYZE_DIR']) delete clean[k];
  const started = Date.now();
  execSync(`${DENO} task build`, { cwd: ROOT, env: { ...clean, ...env }, stdio: 'pipe', maxBuffer: 64 << 20 });
  return Math.round((Date.now() - started) / 1000);
}

export function stylesheetHrefs(html: string): string[] {
  return [...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*>/g)].map((m) => m[0].match(/href="([^"]+)"/)?.[1] ?? '');
}
