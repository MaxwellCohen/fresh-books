import { Button } from '@/components/ui/button.tsx';
import { SlidersHorizontalIcon } from '@/components/ui/icons.tsx';
import { mobileSidebarOpen } from '@/lib/catalog-nav.ts';

export default function MobileSidebarTrigger() {
  return (
    <Button
      aria-label="Open filters"
      className="md:hidden"
      onClick={() => (mobileSidebarOpen.value = true)}
      size="icon"
      variant="ghost"
    >
      <SlidersHorizontalIcon className="size-4" />
    </Button>
  );
}
