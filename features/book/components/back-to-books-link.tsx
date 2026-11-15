import { ArrowLeftIcon } from '@/components/ui/icons.tsx';
import { catalogSearch, type SearchParams } from '@/lib/url-state.ts';
import { cn } from '@/lib/utils.ts';

const linkClass =
  'text-muted hover:bg-card dark:hover:bg-card-dark -ml-1.5 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:text-black dark:hover:text-white';

export function BackToBooksLink({ className, searchParams }: { className?: string; searchParams: SearchParams }) {
  const query = new URLSearchParams(catalogSearch(searchParams)).toString();
  return (
    <a className={cn(linkClass, className)} href={query ? `/?${query}` : '/'}>
      <ArrowLeftIcon className="size-4" />
      Back to books
    </a>
  );
}
