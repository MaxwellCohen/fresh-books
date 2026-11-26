import { page } from 'fresh';
import { withTtlCache } from '@/lib/catalog-cache.server.ts';
import { define } from '../../utils.ts';

let loads = 0;

// Manual: the port's hand-rolled TTL cache (memory Map + host store, 1h TTL, in-flight de-dup)
// wraps a loader that returns a timestamp and a load counter.
const loadStamp = withTtlCache('feature-tests:stamp', async (_generation: string) => {
  await new Promise((r) => setTimeout(r, 200));
  return { stamp: new Date().toISOString(), load: ++loads };
});

export const handler = define.handlers({
  async GET(ctx) {
    // `?gen=` changes the cache key: the manual way to revalidate (new key → fresh load).
    const generation = ctx.url.searchParams.get('gen') ?? 'v1';
    const value = await loadStamp(generation);
    return page({ generation, ...value });
  },
});

export default define.page<typeof handler>(function Caching({ data }) {
  return (
    <>
      <h1>Caching (Manual: withTtlCache)</h1>
      <dl className="mt-4">
        <dt>generation</dt><dd id="ft-cache-gen">{data.generation}</dd>
        <dt>stamp</dt><dd id="ft-cache-stamp">{data.stamp}</dd>
        <dt>load #</dt><dd id="ft-cache-load">{data.load}</dd>
      </dl>
    </>
  );
});
