import { BookMark } from '@/components/book-mark.tsx';
import { buildHref } from '@/lib/url-state.ts';

const linkClass = 'inline-flex items-center gap-2 text-base font-semibold tracking-tight';

export function HomeLink({ delay }: { delay?: string }) {
  return (
    <a aria-label="Fresh Books home" className={linkClass} href={buildHref({ delay })}>
      <BookMark className="text-action size-5" />
      Fresh Books
    </a>
  );
}
