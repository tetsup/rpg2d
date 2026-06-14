import { useTranslation } from 'react-i18next';
import type { NamespacePostParams } from '@sharedTypes/api/namespace';
import { FieldGroupTemplateProps } from '@editor/components/features/form/field-templete';

type NamespaceFieldParams = { mode: 'create' | 'update' };

export function NamespaceFields({ mode }: NamespaceFieldParams): FieldGroupTemplateProps<NamespacePostParams>[] {
  const { t } = useTranslation();

  return [
    {
      title: t('グループ設定'),
      items: [
        { name: 'id', label: t('ID'), type: mode === 'create' ? 'text' : 'disabled-text' },
        { name: 'displayName', label: t('グループ名'), type: 'text' },
        { name: 'description', label: t('グループの説明'), type: 'text' },
        { name: 'isPrivate', label: t('非公開'), type: 'switch', labelOn: t('公開しない'), labelOff: t('公開する') },
      ],
    },
  ];
}
