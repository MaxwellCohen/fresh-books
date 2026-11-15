# Fresh Books

Goodreads catalog demo built with Fresh 2 (Deno, Preact islands, Vite, Tailwind CSS v4). Server-rendered; all state lives in URL query params (`search, page, year, rating, pages, language, list, delay`). Interactive pieces (search, filters, API delay, theme toggle, mobile drawer) are islands; navigation uses Fresh Partials (`f-client-nav`).

## Environment

Copy `.env.example` to `.env`:

- `POSTGRES_URL` - Neon/Postgres connection string. If empty, a built-in preview catalog is served.
- `API_DELAY_MS` - optional artificial server delay in ms.

## Commands

- `deno task dev` - dev server
- `deno task build` - production build to `_fresh/`
- `deno task start` - serve the build (port 8000; loads `.env`)
- `deno task check` - lint + type check

## Deployment

| Host | URL | Build flag |
| --- | --- | --- |
| Vercel | https://fresh-books.vercel.app | `VERCEL=1` (set by Vercel) |
| Netlify | https://fresh-books.netlify.app | `NETLIFY=1` |
| Cloudflare Workers | https://fresh-books.to-email-max.workers.dev | `CLOUDFLARE=1` (or `WORKERS_CI`, set by Workers Builds) |

- Vercel and Netlify are connected to this repo: a push to `main` builds and deploys to both. Cloudflare is deployed with `deno task deploy:cloudflare`.
- The build picks the host adapter from the flag above; with no flag it targets Deno.
- `POSTGRES_URL` is set on every host (Vercel and Netlify environment variable, Cloudflare secret). Without it the app serves the preview catalog.
- Manual deploys: `deno task deploy:vercel`, `deno task deploy:netlify`, `deno task deploy:cloudflare`.
