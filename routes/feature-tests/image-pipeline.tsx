// Third-party: vite-imagetools transforms the source JPEG at build time into resized WebP variants.
import heroSrcset from '@/assets/feature-tests/sample.jpg?w=400;800;1200&format=webp&as=srcset';
import heroSrc from '@/assets/feature-tests/sample.jpg?w=800&format=webp';
// A separate variant set (different widths/quality) so the offscreen image has its own URLs.
import offSrcset from '@/assets/feature-tests/sample.jpg?w=480;960&format=webp&quality=60&as=srcset';
import offSrc from '@/assets/feature-tests/sample.jpg?w=960&format=webp&quality=60';

const sizes = '(max-width: 800px) 100vw, 800px';

export default function ImagePipeline() {
  return (
    <>
      <h1>Image pipeline (Third-party: vite-imagetools)</h1>
      <img id="ft-img-hero" alt="Hero sample" src={heroSrc} srcset={heroSrcset} sizes={sizes} width={800} height={500} fetchpriority="high" decoding="async" className="mt-4 h-auto w-full" />
      <div style={{ height: '2400px' }} aria-hidden="true" />
      <img id="ft-img-offscreen" alt="Offscreen sample" src={offSrc} srcset={offSrcset} sizes={sizes} width={800} height={500} loading="lazy" decoding="async" className="h-auto w-full" />
    </>
  );
}
