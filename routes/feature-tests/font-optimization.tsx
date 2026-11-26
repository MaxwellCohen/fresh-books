import { Head } from 'fresh/runtime';
// Third-party: @fontsource-variable/geist (imported in assets/global.css) self-hosts the font files
// and declares @font-face with font-display: swap. The preload is hand-written: Vite resolves the
// same woff2 file to its hashed /assets URL.
// @ts-expect-error: Deno can't type a bare npm file path with a Vite ?url query; Vite resolves it.
import geistLatin from '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url';

export default function FontOptimization() {
  return (
    <>
      <Head>
        <link id="ft-font-preload" rel="preload" as="font" type="font/woff2" crossorigin="anonymous" href={geistLatin} />
      </Head>
      <h1>Font optimization (Third-party: Fontsource)</h1>
      <p id="ft-font-sample" className="mt-4 font-sans text-xl">Geist Variable, self-hosted via Fontsource.</p>
    </>
  );
}
