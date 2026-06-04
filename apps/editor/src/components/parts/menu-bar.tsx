import type { MouseEventHandler } from 'react';
import type { LucideIcon } from 'lucide-react';

type MenuItem = {
  onClick?: MouseEventHandler<HTMLDivElement>;
  icon: LucideIcon;
  label: string;
};
type MenuBarProps = {
  items: MenuItem[];
  align: 'top' | 'bottom';
};

export function MenuBar({ items, align }: MenuBarProps) {
  return (
    <nav className={`fixed ${align}-0 left-0 right-0 border-t bg-background`}>
      <div className="flex">
        {items.map(({ onClick, icon: Icon, label }, index) => (
          <div
            key={index}
            className="
              flex-1
              flex
              flex-col
              items-center
              justify-center
              gap-1
              py-2
            "
            onClick={onClick}
          >
            <Icon className="h-7 w-7" />
            <span className="text-[10px]">{label}</span>
          </div>
        ))}
      </div>
    </nav>
  );
}
