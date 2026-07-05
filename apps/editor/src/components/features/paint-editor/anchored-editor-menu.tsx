import type { ReactNode } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@editor/components/ui/popover';
import { cn } from '@editor/lib/utils';

type AnchoredEditorMenuSide = 'top' | 'bottom' | 'left' | 'right';
type AnchoredEditorMenuAlign = 'start' | 'center' | 'end';

type AnchoredEditorMenuProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
};

type AnchoredEditorMenuTriggerProps = {
  render: React.ReactElement;
};

type AnchoredEditorMenuContentProps = {
  title: string;
  description?: string;
  side?: AnchoredEditorMenuSide;
  align?: AnchoredEditorMenuAlign;
  sideOffset?: number;
  alignOffset?: number;
  className?: string;
  footer?: ReactNode;
  children: ReactNode;
};

function AnchoredEditorMenu({ open, onOpenChange, children }: AnchoredEditorMenuProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange} modal={false}>
      {children}
    </Popover>
  );
}

function AnchoredEditorMenuTrigger({ render }: AnchoredEditorMenuTriggerProps) {
  return <PopoverTrigger render={render} />;
}

function AnchoredEditorMenuContent({
  title,
  description,
  side = 'bottom',
  align = 'start',
  sideOffset = 6,
  alignOffset = 0,
  className,
  footer,
  children,
}: AnchoredEditorMenuContentProps) {
  return (
    <PopoverContent
      side={side}
      align={align}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      className={cn('flex flex-col gap-2', className)}
      initialFocus={false}
    >
      <PopoverHeader>
        <PopoverTitle>{title}</PopoverTitle>
        {description != null && <PopoverDescription>{description}</PopoverDescription>}
      </PopoverHeader>
      {children}
      {footer != null && <div className="flex justify-end pt-1">{footer}</div>}
    </PopoverContent>
  );
}

export {
  AnchoredEditorMenu,
  AnchoredEditorMenuContent,
  AnchoredEditorMenuTrigger,
  type AnchoredEditorMenuAlign,
  type AnchoredEditorMenuSide,
};
