import { Head } from 'fresh/runtime';

// Manual: a Speculation Rules block. Chrome prefetches same-origin documents on hover (moderate).
const speculationRules = JSON.stringify({
  prefetch: [{
    where: { and: [{ href_matches: '/feature-tests/route-prefetching/*' }, { not: { selector_matches: '[rel~=nofollow]' } }] },
    eagerness: 'moderate',
  }],
});

export default function RoutePrefetching() {
  return (
    <>
      <Head>
        <script type="speculationrules" dangerouslySetInnerHTML={{ __html: speculationRules }} />
      </Head>
      <h1>Route prefetching (Manual: Speculation Rules)</h1>
      {/* Full-page navigation: Fresh partials (f-client-nav) fetch on click and bypass the prefetch. */}
      <p className="mt-4" f-client-nav={false}>
        <a id="ft-prefetch-link" className="underline" href="/feature-tests/route-prefetching/target">Go to target</a>
      </p>
    </>
  );
}
