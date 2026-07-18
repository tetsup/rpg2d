import type { ReactNode } from 'react';
import { cn } from '@editor/lib/utils';
import { TitleBar, type TitleBarProps } from './title-bar';
import { BottomMenu } from './bottom-menu';
import { UserMenu } from './user-menu';

type LayoutShellProps = {
  children: ReactNode;
  titleBarProps: TitleBarProps;
  /** Removes main padding for full-bleed editors (e.g. graphics canvas). */
  flush?: boolean;
};

export function LayoutShell({ children, titleBarProps, flush = false }: LayoutShellProps) {
  const { rightSlot: titleBarRightSlot, ...restTitleBarProps } = titleBarProps;

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <TitleBar
        {...restTitleBarProps}
        rightSlot={
          <>
            {titleBarRightSlot}
            <UserMenu />
          </>
        }
      />

      <main className={cn('min-h-0 flex-1', flush ? 'flex flex-col overflow-hidden' : 'overflow-auto')}>
        <div className={cn(flush ? 'h-full' : 'space-y-4 p-4')}>{children}</div>
      </main>
      <BottomMenu />
    </div>
  );
}
