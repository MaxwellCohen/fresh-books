import { BookSidebar } from '@/features/book/components/book-sidebar.tsx';
import BookSearch from '@/islands/BookSearch.tsx';
import MobileSidebar from '@/islands/MobileSidebar.tsx';
import MobileSidebarTrigger from '@/islands/MobileSidebarTrigger.tsx';
import { searchParamsFromUrl } from '@/lib/url-state.ts';
import { define } from '../utils.ts';

export default define.layout(function Layout({ Component, url }) {
  const current = searchParamsFromUrl(url.searchParams);

  return (
    <>
      <MobileSidebar pathname={url.pathname}>
        <BookSidebar current={current} idPrefix="mobile" mobile />
      </MobileSidebar>
      <div className="group flex min-h-dvh">
        <aside className="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark sticky top-0 hidden h-dvh w-72 shrink-0 flex-col border-r px-5 py-5 md:flex">
          <BookSidebar current={current} idPrefix="desktop" />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-divider bg-surface/80 dark:border-divider-dark dark:bg-surface-dark/80 sticky top-0 z-20 flex items-center gap-2 border-b px-4 py-3 backdrop-blur-md backdrop-saturate-150 sm:gap-3 sm:px-6">
            <MobileSidebarTrigger />
            <BookSearch current={current} />
          </header>

          <main className="flex min-w-0 flex-1 flex-col">
            <Component />
          </main>
        </div>
      </div>
    </>
  );
});
