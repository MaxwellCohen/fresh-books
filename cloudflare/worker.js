import server from "../_fresh/server.js";
import { bindCatalogCache } from "../lib/catalog-cache.server.ts";

export default {
  fetch(request, env, ctx) {
    bindCatalogCache(env?.CATALOG_CACHE);
    return server.fetch(request, env, ctx);
  },
};
