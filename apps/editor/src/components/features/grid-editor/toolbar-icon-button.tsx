import type { ReactNode } from 'react';
import { Button } from '@editor/components/ui/button';
import { cn } from '@editor/lib/utils';
import { SyncIndicatorDot } from './sync-indicator-dot';

type ToolbarIconButtonProps = {
  icon: ReactNode;
  label: string;
  isActive?: boolean;
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
  isActive = false,
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
      variant={isActive ? 'default' : 'secondary'}
      size="icon"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'relative shrink-0 rounded-sm !size-[var(--touch-size)] [&_svg]:!size-[calc(var(--touch-size)*0.5)]',
        className
      )}
      aria-label={label}
      aria-pressed={isActive}
    >
      {icon}
      {children}
      {showDirtyDot && <SyncIndicatorDot variant="dirty" />}
      {!showDirtyDot && showDraftDot && <SyncIndicatorDot variant="draft" />}
    </Button>
  );
}
