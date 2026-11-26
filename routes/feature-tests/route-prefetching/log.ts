import { define } from '../../../utils.ts';
import { requests } from './target.tsx';

// Server-side log of requests to the target route (with Sec-Purpose), read by the test.
export const handler = define.handlers({
  GET() {
    return Response.json(requests);
  },
  DELETE() {
    requests.length = 0;
    return new Response(null, { status: 204 });
  },
});
