import { useState } from 'preact/hooks';

export default function FtCounter({ start }: { start: number }) {
  const [count, setCount] = useState(start);
  return (
    <section id="ft-island" className="mt-4">
      <h2>Interactive island</h2>
      <button id="ft-island-inc" type="button" className="rounded border px-3" onClick={() => setCount((c) => c + 1)}>+1</button>
      <output id="ft-island-count" className="ml-3">{count}</output>
    </section>
  );
}
