import type { ReactNode } from 'react';
import { PageLayout } from '@base/components/layout/page-layout';
import type { TitleBarProps } from '@base/components/navigation/title-bar';
import { BottomMenu } from '../navigation/bottom-menu';
import { EditorTitleBar } from '../navigation/editor-title-bar';

type PageShellProps = {
  children: ReactNode;
  titleBarProps: TitleBarProps;
  flush?: boolean;
};

export function PageShell({ children, titleBarProps, flush }: PageShellProps) {
  return (
    <PageLayout flush={flush} header={<EditorTitleBar {...titleBarProps} />} footer={<BottomMenu />}>
      {children}
    </PageLayout>
  );
}
