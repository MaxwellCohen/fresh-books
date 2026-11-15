import { useState } from 'preact/hooks';
import { Range } from '@/components/ui/range.tsx';
import { navigateCatalog, navPending } from '@/lib/catalog-nav.ts';
import { API_DELAY_VALUES, formatApiDelay, getApiDelayMs, type SearchParams } from '@/lib/url-state.ts';

export default function ApiDelay({ current, idPrefix }: { current: SearchParams; idPrefix: string }) {
  const committed = getApiDelayMs(current);
  const [value, setValue] = useState(committed);

  function commit(next: number) {
    setValue(next);
    const params = { ...current, delay: next === 0 ? undefined : String(next) };
    if (!params.delay) delete params.delay;
    navigateCatalog(params);
  }

  return (
    <div data-filtering={navPending.value ? '' : undefined}>
      <Range
        hint={
          <>
            <span>Off</span>
            <span>3s</span>
          </>
        }
        id={`${idPrefix}-api-delay`}
        label="API delay"
        onValueChange={commit}
        readout={formatApiDelay(value)}
        value={value}
        values={API_DELAY_VALUES}
      />
    </div>
  );
}
