export default function MultiHostDeployment() {
  return (
    <>
      <h1>Multi-host deployment (Manual)</h1>
      <p className="mt-4">Build-time. <code>scripts/adapt.mjs</code> runs after <code>vite build</code> and wraps <code>_fresh/server.js</code> per host:</p>
      <ul className="mt-2 list-disc pl-6">
        <li>no flag: Deno (<code>_fresh/server.js</code>)</li>
        <li><code>VERCEL=1</code>: Build Output API in <code>.vercel/output</code></li>
        <li><code>NETLIFY=1</code>: edge function <code>netlify/edge-functions/fresh.js</code></li>
        <li><code>CLOUDFLARE=1</code>: <code>_fresh/client/_headers</code> + <code>cloudflare/worker.js</code> (bundled by wrangler)</li>
      </ul>
    </>
  );
}
