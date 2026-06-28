import { useTranslation } from 'react-i18next';
import type { FieldGroupTemplateProps } from '@editor/components/features/form/field-templete';
import { ResourceInput } from '@sharedTypes/database/collection';

type ManifestFieldParams = { mode: 'create' | 'update' };

export function ManifestForm({ mode }: ManifestFieldParams): FieldGroupTemplateProps<ResourceInput<'manifest'>>[] {
  const { t } = useTranslation();

  return [
    {
      title: t('プロジェクト概要'),
      items: [
        mode === 'create'
          ? {
              type: 'select-document',
              params: { name: 'namespace', label: t('グループ'), collectionName: 'namespaces' },
            }
          : {
              type: 'text',
              params: {
                name: 'namespace',
                label: t('グループ'),
                disabled: true,
              },
            },
        { type: 'hidden', params: { name: 'type' } },
        { type: 'text', params: { name: 'name', label: t('プロジェクト名') } },
        { type: 'text', params: { name: 'description', label: t('プロジェクトの説明') } },
      ],
    },
    {
      title: t('初期状態'),
      items: [
        {
          type: 'select-document',
          params: {
            name: 'data.initialState.field.fieldId',
            label: t('フィールド'),
            collectionName: 'resources',
            resourceType: 'field',
          },
        },
        {
          type: 'field-position',
          params: {
            name: 'data.initialState.field.pos',
            label: t('プレイヤー位置'),
          },
        },
      ],
    },
    {
      title: t('初期状態'),
      items: [
        {
          type: 'select-document',
          params: {
            name: 'data.config.defaultMessagePanel',
            label: t('メッセージパネル'),
            collectionName: 'resources',
            resourceType: 'panel',
          },
        },
      ],
    },
  ];
}
