import { StaticPanel } from '@/components/feature-tests/static-panel.tsx';
import FtCounter from '@/islands/FtCounter.tsx';

export default function Islands() {
  return (
    <>
      <h1>Islands (1st-party)</h1>
      <StaticPanel />
      <FtCounter start={0} />
    </>
  );
}
