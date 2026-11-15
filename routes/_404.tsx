import { page } from 'fresh';
import { Head } from 'fresh/runtime';
import { buttonClasses } from '@/components/ui/button.tsx';
import { EmptyState } from '@/components/ui/empty-state.tsx';
import { define } from '../utils.ts';

export const handler = define.handlers(() => page(undefined, { status: 404 }));

export default define.page(function NotFound() {
  return (
    <>
      <Head>
        <title>Page not found · Fresh Books</title>
        <meta name="robots" content="noindex" />
      </Head>
      <EmptyState body="That page isn't in the catalog." title="Page not found">
        <a className={buttonClasses({ className: 'mt-1', variant: 'secondary' })} href="/">
          Back to the shelf
        </a>
      </EmptyState>
    </>
  );
});
