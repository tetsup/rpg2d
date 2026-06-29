import type { ReactNode } from 'react';
import { TitleBar, type TitleBarProps } from './title-bar';
import { BottomMenu } from './bottom-menu';
import { UserMenu } from './user-menu';

type LayoutShellProps = {
  children: ReactNode;
  titleBarProps: TitleBarProps;
};

export function LayoutShell({ children, titleBarProps }: LayoutShellProps) {
  return (
    <>
      <TitleBar {...titleBarProps} rightSlot={<UserMenu />} />
      <main>
        <div className="space-y-4 p-4">{children}</div>
      </main>
      <BottomMenu />
    </>
  );
}
