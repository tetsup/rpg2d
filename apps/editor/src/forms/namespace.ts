import { useTranslation } from 'react-i18next';
import { NamespaceInput } from '@sharedTypes/database/collection';
import { FieldGroupTemplateProps } from '@editor/components/features/form/field-templete';

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
            labelOn: t('公開しない'),
            labelOff: t('公開する'),
          },
        },
      ],
    },
  ];
}
