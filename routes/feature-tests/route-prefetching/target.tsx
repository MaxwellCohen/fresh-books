import { page } from 'fresh';
import { define } from '../../../utils.ts';

export const requests: { at: string; secPurpose: string | null }[] = [];

export const handler = define.handlers({
  GET(ctx) {
    requests.push({ at: new Date().toISOString(), secPurpose: ctx.req.headers.get('sec-purpose') });
    return page({});
  },
});

export default function PrefetchTarget() {
  return <h1 id="ft-prefetch-target">Prefetch target</h1>;
}
