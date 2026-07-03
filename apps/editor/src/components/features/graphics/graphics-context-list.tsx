import { Check } from 'lucide-react';
import { cn } from '@editor/lib/utils';
import { Button } from '@editor/components/ui/button';

export type GraphicsContextItem = {
  id: string;
  label: string;
  onSelect: () => void;
};

type GraphicsContextListProps = {
  items: GraphicsContextItem[];
  activeId?: string;
  emptyLabel: string;
};

export function GraphicsContextList({ items, activeId, emptyLabel }: GraphicsContextListProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
      {items.map((item) => {
        const selected = item.id === activeId;
        return (
          <li key={item.id}>
            <Button
              type="button"
              variant={selected ? 'secondary' : 'ghost'}
              className={cn('w-full justify-between', selected && 'font-medium')}
              onClick={item.onSelect}
            >
              <span className="truncate">{item.label}</span>
              {selected && <Check className="size-4 shrink-0" />}
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
