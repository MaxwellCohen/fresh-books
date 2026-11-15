import { EMPTY_IMAGE_URL, getLargeBookImageUrl } from '@/features/book/book-constants.ts';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { cn } from '@/lib/utils.ts';
import { thumbHashToDataURL } from 'thumbhash';

type Props = {
  className?: string;
  priority?: boolean;
  sizes: string;
  src: string | null;
  thumbhash: string | null;
  title: string;
};

function thumbhashUrl(hash: string | null) {
  if (!hash) return undefined;
  try {
    const binary = atob(hash);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return thumbHashToDataURL(bytes);
  } catch {
    return undefined;
  }
}

// Server component: failed images are swapped for the fallback by a tiny global capture-phase
// `error` listener (see `coverErrorScript` in routes/_app.tsx), so no island is needed per cover.

export function BookCover({ className, priority, sizes, src, thumbhash, title }: Props) {
  const resolved = getLargeBookImageUrl(src ?? EMPTY_IMAGE_URL);
  const placeholder = thumbhashUrl(thumbhash);

  return (
    <div className={cn('bg-card dark:bg-card-dark relative aspect-[2/3] w-full overflow-hidden rounded-md', className)}>
      <img
        alt={title}
        className="absolute inset-0 size-full object-cover"
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        loading={priority ? 'eager' : 'lazy'}
        data-cover
        sizes={sizes}
        src={resolved}
        style={
          placeholder
            ? {
                backgroundImage: `url("${placeholder}")`,
                backgroundSize: 'cover',
              }
            : undefined
        }
      />
      <div
        aria-label={`Cover unavailable for ${title}`}
        className="text-muted absolute inset-0 flex items-center justify-center p-3 text-center text-sm"
        hidden
        role="img"
      >
        Cover unavailable
      </div>
    </div>
  );
}

export function BookCoverSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn('skeleton-subtle aspect-[2/3] w-full rounded-md', className)} />;
}
