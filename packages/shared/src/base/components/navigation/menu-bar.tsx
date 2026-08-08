import type { MouseEventHandler } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@base/lib/utils';

type MenuItem = {
  onClick?: MouseEventHandler<HTMLDivElement>;
  icon: LucideIcon;
  label: string;
  active?: boolean;
};
type MenuBarProps = {
  items: MenuItem[];
  align: 'top' | 'bottom';
};

function MenuBarBody({ items, align }: MenuBarProps) {
  return (
    <nav
      className={cn(
        'fixed left-0 right-0 border-t bg-background select-none touch-manipulation',
        align === 'top' ? 'top-0' : 'bottom-0'
      )}
    >
      <div className="flex">
        {items.map(({ onClick, icon: Icon, label, active }, index) => (
          <div
            key={index}
            className={`
              flex-1
              flex
              flex-col
              items-center
              justify-center
              gap-1
              py-2
              ${active ? 'text-primary' : ''}
            `}
            onClick={onClick}
          >
            <Icon className="h-7 w-7" />
            <span className="text-[10px] ">{label}</span>
          </div>
        ))}
      </div>
    </nav>
  );
}

export function MenuBar({ items, align }: MenuBarProps) {
  if (align === 'top')
    return (
      <>
        <div className="h-16" />
        <MenuBarBody items={items} align={align} />
      </>
    );
  else
    return (
      <>
        <MenuBarBody items={items} align={align} />
        <div className="h-16" />
      </>
    );
}
