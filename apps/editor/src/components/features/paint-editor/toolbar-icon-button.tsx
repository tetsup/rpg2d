import type { ReactNode } from 'react';
import { Button } from '@editor/components/ui/button';
import { cn } from '@editor/lib/utils';
import { SyncIndicatorDot } from './sync-indicator-dot';

type ToolbarIconButtonProps = {
  icon: ReactNode;
  label: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  showDirtyDot?: boolean;
  showDraftDot?: boolean;
  className?: string;
  children?: ReactNode;
};

export function ToolbarIconButton({
  icon,
  label,
  pressed = false,
  disabled = false,
  onClick,
  showDirtyDot = false,
  showDraftDot = false,
  className,
  children,
}: ToolbarIconButtonProps) {
  return (
    <Button
      type="button"
      variant={pressed ? 'secondary' : 'outline'}
      size="icon"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'relative shrink-0 !size-[var(--touch-size)] [&_svg]:!size-[calc(var(--touch-size)*0.45)]',
        className
      )}
      aria-label={label}
      aria-pressed={pressed}
    >
      {icon}
      {children}
      {showDirtyDot && <SyncIndicatorDot variant="dirty" />}
      {!showDirtyDot && showDraftDot && <SyncIndicatorDot variant="draft" />}
    </Button>
  );
}
