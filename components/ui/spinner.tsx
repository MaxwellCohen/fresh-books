import { SpinnerIcon } from '@/components/ui/icons.tsx';
import { cn } from '@/lib/utils.ts';

export function Spinner({ className }: { className?: string }) {
  return <SpinnerIcon className={cn('size-4 shrink-0', className)} />;
}
