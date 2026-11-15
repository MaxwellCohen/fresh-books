import { useEffect } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { XIcon } from '@/components/ui/icons.tsx';
import { mobileSidebarOpen } from '@/lib/catalog-nav.ts';
import { cn } from '@/lib/utils.ts';

export default function MobileSidebar({ children, pathname }: { children?: ComponentChildren; pathname: string }) {
  const isOpen = mobileSidebarOpen.value;
  const close = () => {
    mobileSidebarOpen.value = false;
  };

  // Close the drawer after navigating to a different route.
  useEffect(close, [pathname]);

  return (
    <>
      <div
        aria-hidden
        className={cn('fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] md:hidden', isOpen ? 'block' : 'hidden')}
        onClick={close}
      />
      <aside
        className={cn(
          'border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark fixed inset-y-0 left-0 z-50 w-[min(20rem,calc(100vw-3rem))] max-w-full touch-pan-y flex-col overflow-x-hidden border-r pt-[max(1rem,env(safe-area-inset-top))] pr-4 pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] shadow-2xl md:hidden',
          isOpen ? 'flex' : 'hidden',
        )}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest('a[href]')) close();
        }}
      >
        <button
          aria-label="Close filters"
          className="text-muted hover:bg-card focus-visible:ring-accent dark:hover:bg-card-dark absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 grid size-9 place-items-center rounded-md hover:text-black focus-visible:ring-2 focus-visible:outline-none dark:hover:text-white"
          onClick={close}
          type="button"
        >
          <XIcon className="size-5" />
        </button>
        {children}
      </aside>
    </>
  );
}
