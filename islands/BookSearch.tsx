import { useEffect, useId, useRef } from 'preact/hooks';
import { IconButton } from '@/components/ui/icon-button.tsx';
import { SearchIcon, XIcon } from '@/components/ui/icons.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Spinner } from '@/components/ui/spinner.tsx';
import { navigateCatalog, navPending } from '@/lib/catalog-nav.ts';
import { type SearchParams, withFilters } from '@/lib/url-state.ts';

const DEBOUNCE_MS = 220;

export default function BookSearch({ current }: { current: SearchParams }) {
  const pending = navPending.value;
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputId = useId();

  useEffect(() => {
    const input = inputRef.current;
    if (!input || document.activeElement === input) return;
    input.value = current.search ?? '';
  }, [current.search]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  function navigate(value: string) {
    const query = value.trim();
    navigateCatalog(withFilters(current, { search: query || undefined }));
  }

  return (
    <form
      aria-busy={pending}
      className="relative flex-1"
      data-filtering={pending ? '' : undefined}
      onSubmit={(event) => {
        event.preventDefault();
        if (timerRef.current) clearTimeout(timerRef.current);
        navigate(inputRef.current?.value ?? '');
      }}
      role="search"
    >
      <label className="sr-only" htmlFor={inputId}>
        Search books
      </label>
      <span
        aria-hidden
        className="text-muted pointer-events-none absolute top-1/2 left-3.5 flex size-4 -translate-y-1/2 items-center justify-center"
      >
        {pending ? <Spinner className="size-4" /> : <SearchIcon className="size-4" />}
      </span>
      <Input
        className="peer"
        defaultValue={current.search ?? ''}
        id={inputId}
        name="search"
        onInput={(event) => {
          const { value } = event.currentTarget;
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => navigate(value), DEBOUNCE_MS);
        }}
        placeholder="Search books…"
        inputRef={inputRef}
        type="search"
        variant="search"
      />
      <IconButton
        className="absolute top-1/2 right-1.5 -translate-y-1/2 peer-placeholder-shown:hidden"
        label="Clear search"
        onClick={() => {
          if (timerRef.current) clearTimeout(timerRef.current);
          if (inputRef.current) inputRef.current.value = '';
          navigate('');
          inputRef.current?.focus();
        }}
      >
        <XIcon className="size-4" />
      </IconButton>
    </form>
  );
}
