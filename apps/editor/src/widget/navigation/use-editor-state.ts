import { useTranslation } from 'react-i18next';
import { useLayoutStore } from '@editor/stores/edit-state';

export function useEditorState() {
  const { t } = useTranslation();
  const { isDirty } = useLayoutStore((s) => s.editState);

  return {
    isDirty: isDirty == null ? undefined : isDirty,
    label: isDirty == null ? undefined : isDirty ? t('未保存') : t('保存済'),
  };
}
