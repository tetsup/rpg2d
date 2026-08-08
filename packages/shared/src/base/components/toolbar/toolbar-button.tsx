import { Button } from '@base/components/ui/button';
import { cn } from '@base/lib/utils';

export type ToolbarButtonProps = {
  children: React.ReactNode;
  label: string;
  active?: boolean;
  outlined?: boolean;
  disabled?: boolean;
  indicator?: React.ReactNode;
  onClick?: () => void;
  className?: string;
};

export function ToolbarButton({
  children,
  label,
  active = false,
  outlined = false,
  disabled = false,
  indicator,
  onClick,
  className,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant={active ? 'default' : outlined ? 'outline' : 'secondary'}
      size="icon"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn('relative', 'size-[var(--toolbar-button-size)]', 'shrink-0', 'rounded-sm', className)}
    >
      {children}
      {indicator && <div className="absolute top-1 right-1">{indicator}</div>}
    </Button>
  );
}
