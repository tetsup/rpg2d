import type { PropsWithChildren } from 'react';
import { Titlebar } from './titlebar';
import { BottomMenu } from './bottom-menu';

export function LayoutFrame({ children }: PropsWithChildren) {
  return (
    <>
      <Titlebar />
      <main>{children}</main>
      <BottomMenu />
    </>
  );
}
