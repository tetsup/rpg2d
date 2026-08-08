import { TitleBar, type TitleBarProps } from '@base/components/navigation/title-bar';
import { DirtyIndicator } from '@base/components/navigation/dirty-indicator';
import { UserMenu } from './user-menu';
import { useEditorState } from './use-editor-state';

export function EditorTitleBar(props: TitleBarProps) {
  const { isDirty, label } = useEditorState();
  const { rightSlot, ...rest } = props;

  return (
    <TitleBar
      {...rest}
      rightSlot={
        <>
          {isDirty !== undefined && label && <DirtyIndicator isDirty={isDirty} label={label} />}
          {rightSlot}
          <UserMenu />
        </>
      }
    />
  );
}
