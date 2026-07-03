import { Save } from 'lucide-react';
import { Button } from '@editor/components/ui/button';
import { cn } from '@editor/lib/utils';

type GraphicsPartialSaveButtonProps = {
  label: string;
  dirty: boolean;
  valid: boolean;
  saving: boolean;
  onSave: () => void;
  className?: string;
};

export function GraphicsPartialSaveButton({
  label,
  dirty,
  valid,
  saving,
  onSave,
  className,
}: GraphicsPartialSaveButtonProps) {
  return (
    <Button
      type="button"
      variant={dirty ? 'default' : 'outline'}
      size="sm"
      className={cn('shrink-0', className)}
      disabled={!dirty || !valid || saving}
      onClick={onSave}
      aria-label={label}
    >
      <Save className="size-4" />
      <span className="truncate">{saving ? `${label}…` : label}</span>
    </Button>
  );
}
