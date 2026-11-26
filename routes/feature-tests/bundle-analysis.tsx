export default function BundleAnalysis() {
  return (
    <>
      <h1>Bundle analysis (Third-party: rollup-plugin-visualizer)</h1>
      <p className="mt-4">Build-time. <code>ANALYZE=1 deno task build</code> adds <code>rollup-plugin-visualizer</code> to <code>vite.config.ts</code> and writes treemaps to <code>_fresh/stats-client.html</code> and <code>_fresh/stats-ssr.html</code> (override the folder with <code>ANALYZE_DIR</code>).</p>
    </>
  );
}
