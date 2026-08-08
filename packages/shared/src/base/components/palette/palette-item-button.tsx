import { cn } from '@base/lib/utils';
import { Button } from '../ui/button';
import { DeleteBadge } from './delete-badge';

type PaletteItemButtonProps = {
  children: React.ReactNode;
  selected?: boolean;
  deleteMode?: boolean;
  onSelect: () => void;
  onDelete?: () => void;
  label?: string;
};

export function PaletteItemButton({
  children,
  selected = false,
  deleteMode = false,
  onSelect,
  onDelete,
  label,
}: PaletteItemButtonProps) {
  return (
    <Button
      type="button"
      variant={selected ? 'default' : 'outline'}
      size="icon"
      onClick={deleteMode ? onDelete : onSelect}
      aria-label={label}
      aria-pressed={selected}
      className={cn('relative overflow-hidden')}
    >
      {children}
      {deleteMode && <DeleteBadge />}
    </Button>
  );
}
