import { Head } from 'fresh/runtime';
import { HttpError } from 'fresh';
import { buttonClasses } from '@/components/ui/button.tsx';
import { ErrorState } from '@/components/ui/error-state.tsx';
import { define } from '../utils.ts';

export default define.page(function ErrorPage({ error, url }) {
  const status = error instanceof HttpError ? error.status : 500;
  return (
    <>
      <Head>
        <title>{`Error ${status} · Fresh Books`}</title>
      </Head>
      <ErrorState body={error instanceof Error ? error.message : undefined} title="Something went wrong">
        <a
          className={buttonClasses({ className: 'mt-1', size: 'sm', variant: 'secondary' })}
          f-client-nav={false}
          href={url.pathname + url.search}
        >
          Try again
        </a>
      </ErrorState>
    </>
  );
});
