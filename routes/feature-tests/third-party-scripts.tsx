import { Head } from 'fresh/runtime';

// Manual: inject the vendor script at idle time, after load, from an inline snippet in <head>.
const loadWhenIdle = `addEventListener("load",function(){(window.requestIdleCallback||setTimeout)(function(){
var s=document.createElement("script");s.src="/feature-tests/fake-3p.js";s.async=true;s.id="ft-3p";document.head.appendChild(s);});});`;

export default function ThirdPartyScripts() {
  return (
    <>
      <Head>
        <script dangerouslySetInnerHTML={{ __html: loadWhenIdle }} />
      </Head>
      <h1>Third-party scripts (Manual: idle injection)</h1>
      <p id="ft-3p-content" className="mt-4">This content renders before the stand-in vendor script loads.</p>
    </>
  );
}
