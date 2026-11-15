import { Head } from 'fresh/runtime';
import { page } from 'fresh';
import { buttonClasses } from '@/components/ui/button.tsx';
import { ErrorState } from '@/components/ui/error-state.tsx';
import { getBookById } from '@/features/book/book-queries.server.ts';
import { BackToBooksLink } from '@/features/book/components/back-to-books-link.tsx';
import { BookDetail } from '@/features/book/components/book-detail.tsx';
import { waitForApiDelay } from '@/lib/api-delay.ts';
import { getApiDelayMs, searchParamsFromUrl } from '@/lib/url-state.ts';
import { define } from '../utils.ts';

export const handler = define.handlers({
  async GET(ctx) {
    const searchParams = searchParamsFromUrl(ctx.url.searchParams);
    await waitForApiDelay(getApiDelayMs(searchParams));

    try {
      const book = await getBookById(ctx.params.id);
      return page({ book, error: null, searchParams }, { status: book ? 200 : 404 });
    } catch (error) {
      console.error(error);
      return page(
        { book: null, error: error instanceof Error ? error.message : 'Unknown error', searchParams },
        { status: 500 },
      );
    }
  },
});

export default define.page<typeof handler>(function BookPage({ data, url }) {
  const { book, error, searchParams } = data;

  return (
    <div className="flex flex-1 flex-col px-4 py-5 sm:px-6">
      <Head>
        <title>{book ? `${book.title} · Fresh Books` : 'Book · Fresh Books'}</title>
      </Head>
      <BackToBooksLink className="mb-6" searchParams={searchParams} />
      {error !== null
        ? (
          <ErrorState body={error} title="Can't load this book">
            <a
              className={buttonClasses({ className: 'mt-1', size: 'sm', variant: 'secondary' })}
              f-client-nav={false}
              href={url.pathname + url.search}
            >
              Try again
            </a>
          </ErrorState>
        )
        : <BookDetail book={book} />}
    </div>
  );
});
