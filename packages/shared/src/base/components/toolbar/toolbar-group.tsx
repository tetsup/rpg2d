import type { ReactNode } from 'react';

type ToolbarGroupProps = {
  children: ReactNode;
};

export function ToolbarGroup({ children }: ToolbarGroupProps) {
  return (
    <div
      className="
        flex
        shrink-0
        items-center
        gap-[var(--toolbar-gap)]
    "
    >
      {children}
    </div>
  );
}
