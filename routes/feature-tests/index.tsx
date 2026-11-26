import { FEATURES } from '@/lib/feature-tests.ts';

export default function FeatureTestsIndex() {
  return (
    <>
      <h1>Fresh feature tests</h1>
      <p className="mt-2 text-sm">One page per Framework Compare feature, each implemented the way its label says.</p>
      <ul className="mt-6 list-disc space-y-1 pl-6">
        {FEATURES.map((f) => (
          <li key={f.id}>
            <a className="underline" href={`/feature-tests/${f.id}`}>{f.title}</a> <span className="text-muted">({f.label})</span>
          </li>
        ))}
      </ul>
    </>
  );
}
