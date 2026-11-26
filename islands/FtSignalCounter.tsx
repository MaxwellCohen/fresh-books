import { useSignal } from '@preact/signals';
import { useRef } from 'preact/hooks';

export default function FtSignalCounter() {
  const count = useSignal(0);
  const renders = useRef(0);
  renders.current++;
  if (typeof window !== 'undefined') (window as unknown as { __ftRenders: number }).__ftRenders = renders.current;
  return (
    <section className="mt-4">
      <button id="ft-signal-inc" type="button" className="rounded border px-3" onClick={() => count.value++}>+1</button>
      {/* Passing the signal itself binds it to this text node: updates skip the component render. */}
      <output id="ft-signal-count" className="ml-3">{count}</output>
      <p>component renders: <span id="ft-signal-renders">{renders.current}</span></p>
    </section>
  );
}
