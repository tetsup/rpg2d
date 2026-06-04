import type { ReactNode } from 'react';
import { TitleBar, type TitleBarProps } from './title-bar';
import { BottomMenu } from './bottom-menu';

type LayoutShellProps = {
  children: ReactNode;
  titleBarProps: TitleBarProps;
};

export function LayoutShell({ children, titleBarProps }: LayoutShellProps) {
  return (
    <>
      <TitleBar {...titleBarProps} />
      <main>{children}</main>
      <BottomMenu />
    </>
  );
}
