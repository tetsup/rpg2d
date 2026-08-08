import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@base/components/ui/dropdown-menu';

export type DropdownMenuItemData = {
  label: ReactNode;
  icon?: LucideIcon;
  disabled?: boolean;
  onClick?: () => void;
};

export type DropdownMenuProps = {
  trigger: React.ComponentProps<typeof DropdownMenuTrigger>['render'];
  groups: DropdownMenuItemData[][];
  align?: 'start' | 'center' | 'end';
  widthClassName?: string;
};

export function AppDropdownMenu({ trigger, groups, align = 'end', widthClassName = 'w-48' }: DropdownMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger} />

      <DropdownMenuContent align={align} className={widthClassName}>
        {groups.map((group, groupIndex) => (
          <div key={groupIndex}>
            {group.map((item, itemIndex) => {
              const Icon = item.icon;

              return (
                <DropdownMenuItem key={itemIndex} disabled={item.disabled} onClick={item.onClick}>
                  {Icon && <Icon className="mr-2 h-4 w-4" />}

                  {item.label}
                </DropdownMenuItem>
              );
            })}

            {groupIndex !== groups.length - 1 && <DropdownMenuSeparator />}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
