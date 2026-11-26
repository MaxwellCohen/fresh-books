import { defineConfig } from '@playwright/test';

export const PORT = Number(process.env.PORT ?? 4129);
const phase = process.env.FT_PHASE ?? 'runtime';
const BUILD_SPECS = ['bundle-analysis.spec.ts', 'multi-host-deployment.spec.ts'];

export default defineConfig({
  testDir: '.',
  testMatch: phase === 'build' ? BUILD_SPECS : '*.spec.ts',
  testIgnore: phase === 'build' ? [] : BUILD_SPECS,
  workers: 1,
  fullyParallel: false,
  retries: 0,
  timeout: phase === 'build' ? 15 * 60_000 : 60_000,
  reporter: [['list'], ['json', { outputFile: `.out/${phase}.json` }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    launchOptions: { executablePath: process.env.CHROME_PATH ?? '/home/maxc/.local/bin/google-chrome' },
  },
  webServer: phase === 'build' ? undefined : {
    // Production build (run.mjs builds first); served by Deno on PORT with no .env (preview catalog).
    command: `${process.env.FT_DENO ?? 'deno'} serve -A --port ${PORT} _fresh/server.js`,
    cwd: '..',
    url: `http://localhost:${PORT}/feature-tests`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
