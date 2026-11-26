export default function RenderModes() {
  return (
    <>
      <h1>Render modes (Manual)</h1>
      <p className="mt-2">Every route renders on the server. The mode is chosen per route in <code>_middleware.ts</code> with a Cache-Control header plus an in-process HTML cache:</p>
      <ul className="mt-4 list-disc pl-6">
        <li><a className="underline" href="/feature-tests/render-modes/static">static</a>: rendered once, reused until redeploy (<code>s-maxage=31536000</code>)</li>
        <li><a className="underline" href="/feature-tests/render-modes/isr">isr</a>: reused for 3s, then re-rendered (<code>s-maxage=3, stale-while-revalidate</code>)</li>
        <li><a className="underline" href="/feature-tests/render-modes/ssr">ssr</a>: rendered per request (<code>private, no-store</code>)</li>
      </ul>
    </>
  );
}
