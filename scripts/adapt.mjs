// Post-build host adapter. Host chosen by env: NETLIFY=1 | VERCEL=1 | CLOUDFLARE=1.
// With none set this is a no-op (plain Deno build).
import { build } from "npm:esbuild@0.25.12";

const host = Deno.env.get("NETLIFY") ? "netlify"
  : Deno.env.get("VERCEL") ? "vercel"
  : Deno.env.get("CLOUDFLARE") ? "cloudflare"
  : null;
if (!host) Deno.exit(0);

// Fresh resolves its static-file root from import.meta.dirname (Deno-only usage).
const entry = "_fresh/server/server-entry.mjs";
const src = await Deno.readTextFile(entry);
await Deno.writeTextFile(
  entry,
  src.replaceAll("import.meta.dirname", '"/var/task/_fresh/server"'),
);

const common = {
  bundle: true,
  format: "esm",
  logLevel: "warning",
  minify: false,
  legalComments: "none",
};

if (host === "vercel") {
  const out = ".vercel/output";
  await Deno.remove(out, { recursive: true }).catch(() => {});
  await Deno.mkdir(`${out}/functions/index.func`, { recursive: true });
  await Deno.mkdir(`${out}/static`, { recursive: true });
  await build({
    ...common,
    entryPoints: ["scripts/vercel-handler.mjs"],
    outfile: `${out}/functions/index.func/index.mjs`,
    platform: "node",
    target: "node24",
  });
  await Deno.writeTextFile(
    `${out}/functions/index.func/.vc-config.json`,
    JSON.stringify({
      runtime: "nodejs24.x",
      handler: "index.mjs",
      launcherType: "Nodejs",
      supportsResponseStreaming: true,
    }),
  );
  await Deno.writeTextFile(
    `${out}/functions/index.func/package.json`,
    '{"type":"module"}',
  );
  await new Deno.Command("cp", {
    args: ["-R", "_fresh/client/.", `${out}/static/`],
  }).output();
  await Deno.writeTextFile(
    `${out}/config.json`,
    JSON.stringify({
      version: 3,
      routes: [
        { handle: "filesystem" },
        { src: "/(.*)", dest: "/index" },
      ],
    }),
  );
} else if (host === "netlify") {
  await Deno.mkdir("netlify/edge-functions", { recursive: true });
  await build({
    ...common,
    entryPoints: ["scripts/netlify-edge.mjs"],
    outfile: "netlify/edge-functions/fresh.js",
    platform: "neutral",
    external: ["node:*"],
    mainFields: ["module", "main"],
    conditions: ["worker", "browser", "import"],
  });
}
// cloudflare: wrangler bundles cloudflare/worker.js itself.
