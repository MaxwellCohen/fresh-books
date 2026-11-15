import { GitHubIcon } from '@/components/ui/github-icon.tsx';
import ApiDelay from '@/islands/ApiDelay.tsx';
import BookFilters from '@/islands/BookFilters.tsx';
import ThemeToggle from '@/islands/ThemeToggle.tsx';
import { CatalogSize } from '@/features/book/components/catalog-size.tsx';
import { HomeLink } from '@/features/book/components/home-link.tsx';
import type { SearchParams } from '@/lib/url-state.ts';

export function BookSidebar({
  current,
  idPrefix,
  mobile = false,
}: {
  current: SearchParams;
  idPrefix: string;
  mobile?: boolean;
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <HomeLink delay={current.delay} />
      </div>
      <div className="border-divider dark:border-divider-dark mt-6 border-b pb-5">
        <CatalogSize />
      </div>
      <div className="mt-5 mb-4">
        <ApiDelay current={current} idPrefix={idPrefix} />
      </div>
      <p className="text-muted mb-4 text-xs font-semibold tracking-wide uppercase">Filters</p>
      <BookFilters current={current} idPrefix={idPrefix} />
      {mobile ? null : (
        <div className="border-divider dark:border-divider-dark mt-4 flex items-center justify-between gap-2 border-t pt-4">
          <ThemeToggle variant="inline" />
          <a
            aria-label="View source on GitHub"
            className="text-muted rounded-full p-1.5 transition-colors hover:text-black dark:hover:text-white"
            href="https://github.com/MaxwellCohen/fresh-books"
            rel="noopener noreferrer"
            target="_blank"
          >
            <GitHubIcon className="size-4" />
          </a>
        </div>
      )}
    </>
  );
}
