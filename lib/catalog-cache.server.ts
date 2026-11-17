/** Catalog cache: in-memory Map + host durable store, TTL 1h, in-flight de-dup. Every layer fails soft. */
export const CATALOG_CACHE_REVALIDATE_SECONDS = 3600
export const VERCEL_DOCUMENT_CACHE_CONTROL = 'public, max-age=0, must-revalidate'
export const PRIVATE_DOCUMENT_CACHE_CONTROL =
  'private, no-cache, no-store, max-age=0, must-revalidate'

const TTL_MS = CATALOG_CACHE_REVALIDATE_SECONDS * 1000

type Entry<T> = { expiresAt: number; value: T }
type CatalogKv = {
  get(key: string, type: 'json'): Promise<unknown>
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>
}

const memory = new Map<string, Entry<unknown>>()
const inflight = new Map<string, Promise<unknown>>()

function envFlag(name: string): string | undefined {
  try {
    const g = globalThis as {
      Deno?: { env: { get(k: string): string | undefined } }
      process?: { env: Record<string, string | undefined> }
    }
    return g.Deno?.env.get(name) ?? g.process?.env?.[name]
  } catch {
    return undefined
  }
}

function isVercel() {
  return Boolean(envFlag('VERCEL')) && !envFlag('CLOUDFLARE')
}

function isNetlify() {
  return Boolean(envFlag('NETLIFY') || envFlag('NETLIFY_BLOBS_CONTEXT')) &&
    !envFlag('CLOUDFLARE') && !envFlag('VERCEL')
}

export function hostDocumentCacheControl(): string {
  return isVercel() ? VERCEL_DOCUMENT_CACHE_CONTROL : PRIVATE_DOCUMENT_CACHE_CONTROL
}

let catalogKv: CatalogKv | undefined

/** Bind Workers KV so catalog queries persist across isolates. */
export function bindCatalogCache(kv: CatalogKv | undefined) {
  if (kv) catalogKv = kv
}

function edgeRequest(key: string) {
  return new Request(`https://example.com/books-catalog-cache/v1/${encodeURIComponent(key)}`)
}

function edgeCache(): Cache | undefined {
  return (globalThis as { caches?: { default?: Cache } }).caches?.default
}

function memoryGet<T>(key: string): T | undefined {
  const hit = memory.get(key) as Entry<T> | undefined
  if (hit && hit.expiresAt > Date.now()) return hit.value
}

async function platformGet<T>(key: string): Promise<T | undefined> {
  try {
    if (catalogKv) {
      const value = await catalogKv.get(key, 'json')
      if (value != null) return value as T
      return
    }
  } catch { /* KV optional */ }

  try {
    if (isVercel()) {
      const { getCache } = await import('@vercel/functions')
      const value = await getCache({ namespace: 'catalog' }).get(key)
      if (value != null) return value as T
      return
    }
  } catch { /* not on Vercel */ }

  try {
    if (isNetlify()) {
      const { getStore } = await import('@netlify/blobs')
      const stored = (await getStore('catalog-cache').get(key, { type: 'json' })) as Entry<T> | null
      if (stored && stored.expiresAt > Date.now()) return stored.value
      return
    }
  } catch { /* blobs unavailable in this runtime */ }

  try {
    const cache = edgeCache()
    if (cache) {
      const hit = await cache.match(edgeRequest(key))
      if (hit?.ok) return (await hit.json()) as T
    }
  } catch { /* ignore */ }
}

async function platformSet<T>(key: string, value: T): Promise<void> {
  try {
    if (catalogKv) {
      await catalogKv.put(key, JSON.stringify(value), {
        expirationTtl: CATALOG_CACHE_REVALIDATE_SECONDS,
      })
      return
    }
  } catch { /* KV optional */ }

  try {
    if (isVercel()) {
      const { getCache } = await import('@vercel/functions')
      await getCache({ namespace: 'catalog' }).set(key, value, {
        tags: ['catalog'],
        ttl: CATALOG_CACHE_REVALIDATE_SECONDS,
      })
      return
    }
  } catch { /* not on Vercel */ }

  try {
    if (isNetlify()) {
      const { getStore } = await import('@netlify/blobs')
      await getStore('catalog-cache').setJSON(key, { expiresAt: Date.now() + TTL_MS, value })
      return
    }
  } catch { /* blobs unavailable in this runtime */ }

  try {
    const cache = edgeCache()
    if (cache) {
      await cache.put(
        edgeRequest(key),
        new Response(JSON.stringify(value), {
          headers: {
            'Cache-Control': `max-age=${CATALOG_CACHE_REVALIDATE_SECONDS}`,
            'Content-Type': 'application/json',
          },
        }),
      )
    }
  } catch { /* ignore */ }
}

export function cacheLifeHours<T>(key: string, load: () => Promise<T>): Promise<T> {
  const cached = memoryGet<T>(key)
  if (cached !== undefined) return Promise.resolve(cached)

  const pending = inflight.get(key)
  if (pending) return pending as Promise<T>

  const next = (async () => {
    const remote = await platformGet<T>(key)
    if (remote !== undefined) {
      memory.set(key, { expiresAt: Date.now() + TTL_MS, value: remote })
      return remote
    }
    const value = await load()
    memory.set(key, { expiresAt: Date.now() + TTL_MS, value })
    await platformSet(key, value)
    return value
  })().finally(() => {
    inflight.delete(key)
  })

  inflight.set(key, next)
  return next
}

export function withTtlCache<Args extends unknown[], Result>(
  name: string,
  fn: (...args: Args) => Promise<Result>,
): (...args: Args) => Promise<Result> {
  return (...args: Args) => cacheLifeHours(`${name}:${JSON.stringify(args)}`, () => fn(...args))
}
