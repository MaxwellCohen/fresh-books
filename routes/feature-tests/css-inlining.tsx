import { Head } from 'fresh/runtime';
// Manual: Vite's ?inline returns the CSS as a string; we render it in <style> ourselves.
// Route files are server-only, so the string never reaches a client bundle and no <link> is emitted.
import inlineCss from '../../assets/feature-tests/css-inlining.css?inline';

export default function CssInlining() {
  return (
    <>
      <Head>
        <style id="ft-inline-style" dangerouslySetInnerHTML={{ __html: inlineCss }} />
      </Head>
      <h1>CSS inlining (Manual)</h1>
      <p id="ft-inline-box" className="ft-inline-marker-q7z mt-4">
        Styled only by CSS inlined into this route's HTML via <code>?inline</code>.
      </p>
    </>
  );
}
