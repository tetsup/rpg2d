import type { ReactElement, ReactNode } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@base/components/ui/popover';
import { cn } from '@base/lib/utils';

export type ToolbarMenuSide = 'top' | 'bottom' | 'left' | 'right';
export type ToolbarMenuAlign = 'start' | 'center' | 'end';

export type ToolbarMenuProps = {
  trigger: ReactElement;
  title: string;
  description?: string;
  side?: ToolbarMenuSide;
  align?: ToolbarMenuAlign;
  sideOffset?: number;
  alignOffset?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: 'sm' | 'xs';
  footer?: ReactNode;
  children: ReactNode;
};

export function ToolbarMenu({
  trigger,
  title,
  description,
  side = 'bottom',
  align = 'start',
  sideOffset = 6,
  alignOffset = 0,
  open,
  onOpenChange,
  size = 'xs',
  footer,
  children,
}: ToolbarMenuProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange} modal={false}>
      <PopoverTrigger render={trigger} />

      <PopoverContent
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        initialFocus={false}
        className={cn('flex w-72 flex-col gap-2', `max-w-${size}`)}
      >
        <PopoverHeader>
          <PopoverTitle>{title}</PopoverTitle>

          {description && <PopoverDescription>{description}</PopoverDescription>}
        </PopoverHeader>

        <div className="flex items-center justify-center gap-2">{children}</div>

        {footer && <div className="flex justify-end pt-1">{footer}</div>}
      </PopoverContent>
    </Popover>
  );
}
