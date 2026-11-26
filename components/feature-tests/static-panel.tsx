// Server-only component: rendered to HTML, never hydrated. The marker must not appear in any client JS.
export const STATIC_MARKER = 'FT_STATIC_ONLY_MARKER_k9p2';

export function StaticPanel() {
  const rows = ['alpha', 'beta', 'gamma'].map((s) => `${STATIC_MARKER}:${s}`);
  return (
    <section id="ft-static-panel" className="mt-4">
      <h2>Static component</h2>
      <ul>{rows.map((r) => <li key={r}>{r}</li>)}</ul>
    </section>
  );
}
