import { defineConfig, perEnvironmentPlugin, type PluginOption } from "vite";
import { fresh } from "@fresh/plugin-vite";
import tailwindcss from "@tailwindcss/vite";
import { imagetools } from "vite-imagetools";
import { visualizer } from "rollup-plugin-visualizer";

// Fresh's Deno resolver drops query strings (`?inline`, `?url`, imagetools' `?w=...`), so resolve
// those imports here first: resolve the bare path, then re-attach the query for Vite/imagetools.
const keepQuery: PluginOption = {
  name: "feature-tests:keep-query",
  enforce: "pre",
  async resolveId(id, importer, options) {
    const q = id.indexOf("?");
    if (q === -1 || id.startsWith("\0") || id.startsWith("/@")) return null;
    const bare = id.slice(0, q);
    if (!/\.(css|woff2?|jpe?g|png|webp|avif)$/.test(bare)) return null;
    const resolved = await this.resolve(bare, importer, { ...options, skipSelf: true });
    return resolved ? resolved.id.split("?")[0] + id.slice(q) : null;
  },
};

const plugins: PluginOption[] = [keepQuery, fresh(), tailwindcss(), imagetools()];

// Bundle analysis (third-party): `ANALYZE=1 deno task build` writes one treemap report per
// Vite environment: <ANALYZE_DIR>/stats-client.html and stats-ssr.html (default dir `_fresh`).
if (Deno.env.get("ANALYZE")) {
  const dir = Deno.env.get("ANALYZE_DIR") ?? "_fresh";
  plugins.push(
    perEnvironmentPlugin("feature-tests:visualizer", (env) =>
      visualizer({
        filename: `${dir}/stats-${env.name}.html`,
        template: "treemap",
        gzipSize: true,
      }) as never),
  );
}

export default defineConfig({ plugins });
