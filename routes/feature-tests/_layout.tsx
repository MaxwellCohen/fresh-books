import type { RouteConfig } from 'fresh';
import { define } from '../../utils.ts';

// Feature-test pages opt out of the books sidebar/header layout.
export const config: RouteConfig = { skipInheritedLayouts: true };

export default define.layout(function FeatureTestsLayout({ Component }) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <p className="mb-6 text-sm">
        <a href="/feature-tests" className="underline">Feature tests</a> · <a href="/" className="underline">Books</a>
      </p>
      <Component />
    </main>
  );
});
