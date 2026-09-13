import { Plus } from 'lucide-react';
import type { ButtonProps } from '@base-ui/react';
import { cn } from '@base/lib/utils';
import { Button } from '../ui/button';

type GridAddButtonProps = ButtonProps & { height?: number };

export function GridAddButton({ height = 0, className, ...props }: GridAddButtonProps) {
  return (
    <Button
      variant="outline"
      className={cn(
        `min-w-0 min-h-${height} h-full`,
        'items-center justify-center rounded-md border transition-colors hover:bg-accent hover:text-accent-foreground',
        className
      )}
      {...props}
    >
      <Plus className="size-5" />
    </Button>
  );
}
