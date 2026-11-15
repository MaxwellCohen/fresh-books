import { EmptyState } from '@/components/ui/empty-state.tsx';
import { ITEMS_PER_PAGE, PRIORITY_COVER_COUNT } from '@/features/book/book-constants.ts';
import type { BookSummary } from '@/features/book/book-types.ts';
import { BookCard, BookCardSkeleton } from '@/features/book/components/book-card.tsx';
import type { SearchParams } from '@/lib/url-state.ts';

const gridClass = 'grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7';

export function BookGrid({ books, searchParams }: { books: BookSummary[]; searchParams: SearchParams }) {
  if (books.length === 0) {
    return (
      <EmptyState
        body="Nothing matched these filters. Try widening the year range or clearing the search."
        title="No books found"
      />
    );
  }

  return (
    <div className={gridClass}>
      {books.map((book, index) => (
        <BookCard
          book={book}
          key={book.id}
          priority={index < PRIORITY_COVER_COUNT}
          searchParams={searchParams}
        />
      ))}
    </div>
  );
}

export function BookGridSkeleton({ count = ITEMS_PER_PAGE }: { count?: number }) {
  return (
    <div aria-hidden className={gridClass}>
      {Array.from({ length: count }).map((_, index) => (
        <BookCardSkeleton key={index} />
      ))}
    </div>
  );
}
