import { Head } from 'fresh/runtime';
import { page } from 'fresh';
import { buttonClasses } from '@/components/ui/button.tsx';
import { ErrorState } from '@/components/ui/error-state.tsx';
import { getBooksCount, getBooksPage } from '@/features/book/book-queries.server.ts';
import { toBookFilters, toBookQuery } from '@/features/book/book-utils.ts';
import { BookGrid } from '@/features/book/components/book-grid.tsx';
import { BookPagination } from '@/features/book/components/book-pagination.tsx';
import { waitForApiDelay } from '@/lib/api-delay.ts';
import { getApiDelayMs, searchParamsFromUrl } from '@/lib/url-state.ts';
import { define } from '../utils.ts';

export const handler = define.handlers({
  async GET(ctx) {
    const searchParams = searchParamsFromUrl(ctx.url.searchParams);
    const query = toBookQuery(searchParams);
    await waitForApiDelay(getApiDelayMs(searchParams));

    try {
      const [books, totalResults] = await Promise.all([
        getBooksPage(query),
        getBooksCount(toBookFilters(query)),
      ]);
      return page({ books, error: null, searchParams, totalResults });
    } catch (error) {
      console.error(error);
      return page(
        {
          books: [],
          error: error instanceof Error ? error.message : 'Unknown error',
          searchParams,
          totalResults: 0,
        },
        { status: 500 },
      );
    }
  },
});

export default define.page<typeof handler>(function Home({ data, url }) {
  const { books, error, searchParams, totalResults } = data;

  if (error !== null) {
    return (
      <ErrorState body={error} title="Can't load books">
        <a className={retryClass} href={url.pathname + url.search} f-client-nav={false}>
          Try again
        </a>
      </ErrorState>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Head>
        <title>Books · Fresh Books</title>
      </Head>
      <div className="flex-1 px-4 py-5 transition-opacity duration-200 ease-out group-has-[[data-filtering]]:opacity-60 sm:px-6">
        <BookGrid books={books} searchParams={searchParams} />
      </div>
      <footer className="border-divider dark:border-divider-dark mt-auto border-t px-4 py-3 sm:px-6">
        <BookPagination searchParams={searchParams} totalResults={totalResults} />
      </footer>
    </div>
  );
});

const retryClass = buttonClasses({ className: 'mt-1', size: 'sm', variant: 'secondary' });
