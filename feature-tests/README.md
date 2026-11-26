# Feature tests (Fresh)

Validates each Framework Compare label for Fresh against a production build. Each feature has a page at
`/feature-tests/<featureId>` (index at `/feature-tests`) and a Playwright spec here.

## Run

```sh
deno task test:features          # from the repo root, or:
cd feature-tests && npm install && npm run test:features
```

`run.mjs` does: build-time specs (they run their own `deno task build`s) → clean `deno task build` →
`deno serve -A --port 4129 _fresh/server.js` (Playwright `webServer`, no `.env`, preview catalog) →
runtime specs → `results.json`. Chrome comes from `/home/maxc/.local/bin/google-chrome` (override `CHROME_PATH`);
`PORT` defaults to 4129 (the multi-host smoke test also uses PORT+1).

Deno: uses `FT_DENO`, else `deno` on PATH, else `~/.deno-npm/node_modules/@deno/linux-x64-glibc/deno`, else
`npx --yes deno@2.9.6`. On this machine Deno was installed with `npm install deno@2.9.6` into `~/.deno-npm`
(the deno.land installer download was too slow).

## What each spec checks

| Feature | Label | Implementation | Test asserts |
| --- | --- | --- | --- |
| css-inlining | Manual | `?inline` CSS import → `<style>` in `<Head>` | inline `<style>` has the route's marker class; no `<link rel=stylesheet>` body contains it; style applied |
| font-optimization | Third-party | Fontsource (`@fontsource-variable/geist`) + hand-written preload | no Google Fonts requests; every Geist `@font-face` has `font-display: swap`; preload href = `@font-face` src, same-origin `font/woff2`; font loaded |
| image-pipeline | Third-party | `vite-imagetools` (`?w=…&format=webp&as=srcset`) | ≥2 srcset widths, width/height, offscreen `loading=lazy` not requested until scrolled, srcset URLs are `image/webp` |
| caching | Manual | port's `withTtlCache` around a timestamp loader | concurrent + later requests share stamp/load #; new key → fresh load |
| route-prefetching | Manual | `<script type="speculationrules">` (moderate) | hover → request for the target document before click (`page.on('request')` + server log with `Sec-Purpose`) |
| islands | 1st-party | `islands/FtCounter.tsx` + server-only `StaticPanel` | island works after hydration; no loaded JS contains the static marker |
| render-modes | Manual | `render-modes/_middleware.ts`: Cache-Control + in-memory HTML cache | static: stable timestamp + `s-maxage=31536000`; isr: stable <3s then re-rendered; ssr: new per request + `no-store` |
| reactivity | 1st-party | `useSignal` from `@preact/signals` bound in JSX | 3 clicks → text 3, render counter stays 1 |
| bundle-analysis | Third-party | `rollup-plugin-visualizer` when `ANALYZE=1` | `ANALYZE=1 deno task build` writes a treemap HTML |
| third-party-scripts | Manual | inline snippet injects async script at idle after load | no `<script src>` in server HTML; script ran after load/FCP and is async |
| multi-host-deployment | Manual | `scripts/adapt.mjs` | Vercel output + Node function smoke (200), Netlify edge fn smoke (200), Cloudflare `_headers` + worker bundles, Deno build |

Notes:
- Fresh's Vite plugin resolves imports through Deno and drops query strings, so `?inline`, `?url` and
  imagetools queries fail out of the box. `vite.config.ts` adds a small `enforce: "pre"` resolver that keeps them.
- `main.ts` leaves `Cache-Control` alone on responses that carry `X-Render-Cache` (only the render-modes routes).
- No `suggestedLabel` is set: every feature behaved as its label describes (see `results.json`).
