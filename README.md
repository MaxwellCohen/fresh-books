# Fresh Books

Goodreads catalog demo built with Fresh 2 (Deno, Preact islands, Vite, Tailwind CSS v4). Server-rendered; all state lives in URL query params (`search, page, year, rating, pages, language, list, delay`). Interactive pieces (search, filters, API delay, theme toggle, mobile drawer) are islands; navigation uses Fresh Partials (`f-client-nav`).

## Environment

Copy `.env.example` to `.env`:

- `POSTGRES_URL` - Neon/Postgres connection string. If empty, a built-in preview catalog is served.
- `API_DELAY_MS` - optional artificial server delay in ms.

## Commands

- `deno task dev` - dev server
- `deno task build` - production build to `_fresh/`
- `deno task start` - serve the build on port 4326
- `deno task check` - lint + type check
