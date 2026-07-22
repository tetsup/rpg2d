import { useTranslation } from 'react-i18next';
import type { NamespaceInput } from '@sharedTypes/database/collection';
import type { FieldGroupTemplateProps } from '@editor/shared/form/components/field-templete';

type NamespaceFieldParams = { mode: 'create' | 'update' };

export function NamespaceFields({ mode }: NamespaceFieldParams): FieldGroupTemplateProps<NamespaceInput>[] {
  const { t } = useTranslation();

  return [
    {
      title: t('グループ設定'),
      items: [
        {
          type: 'text',
          params: { name: 'id', label: t('ID'), disabled: mode === 'update' },
        },
        {
          type: 'text',
          params: { name: 'presenceName', label: t('グループ名') },
        },
        {
          type: 'text',
          params: { name: 'description', label: t('グループの説明') },
        },
        {
          type: 'switch',
          params: {
            name: 'isPrivate',
            label: t('非公開'),
            variant: 'segmented',
            labelOn: t('公開しない'),
            labelOff: t('公開する'),
          },
        },
      ],
    },
  ];
}
