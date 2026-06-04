import { PropsWithChildren } from 'react';
import { LayoutFrame } from './frame';

export function PageLayout({ children }: PropsWithChildren) {
  return <LayoutFrame>{children}</LayoutFrame>;
}
