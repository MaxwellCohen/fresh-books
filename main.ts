import { App, staticFiles } from "fresh";
import type { State } from "./utils.ts";
import { hostDocumentCacheControl } from "./lib/catalog-cache.server.ts";

export const app = new App<State>();

app.use(staticFiles());

app.use(async (ctx) => {
  const res = await ctx.next();
  if (!res.headers.get("content-type")?.includes("text/html")) return res;
  const headers = new Headers(res.headers);
  headers.set("Cache-Control", hostDocumentCacheControl());
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
});

// Include file-system based routes here
app.fsRoutes();
