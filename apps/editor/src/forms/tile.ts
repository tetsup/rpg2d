import { useTranslation } from 'react-i18next';
import { createResourceInputSchema } from '@schema/database/resource';
import type { FieldGroupTemplateProps } from '@editor/components/features/form/field-templete';
import type { ResourceInput } from '@sharedTypes/database/collection';

type TileFieldParams = { mode: 'create' | 'update' };

export const tileInputSchema = createResourceInputSchema('tile');

export function createTileDefaultValues(namespace = ''): ResourceInput<'tile'> {
  return {
    namespace,
    type: 'tile',
    name: '',
    version: 0,
    description: '',
    isDraft: true,
    data: {
      texture: null,
      allowOverwrap: false,
    },
  };
}

export function TileForm({ mode }: TileFieldParams): FieldGroupTemplateProps<ResourceInput<'tile'>>[] {
  const { t } = useTranslation();

  return [
    {
      title: t('基本情報'),
      items: [
        {
          type: 'text',
          params: { name: 'namespace', label: t('グループ'), disabled: true },
        },
        { type: 'hidden', params: { name: 'type' } },
        {
          type: 'text',
          params: { name: 'name', label: t('名前'), disabled: mode === 'update' },
        },
        { type: 'text', params: { name: 'description', label: t('説明') } },
      ],
    },
    {
      title: t('見た目'),
      items: [
        {
          type: 'select-document',
          params: {
            name: 'data.texture',
            label: t('テクスチャ'),
            collectionName: 'resources',
            resourceType: 'texture',
          },
        },
        {
          type: 'switch',
          params: {
            name: 'data.allowOverwrap',
            label: t('重ね表示'),
            variant: 'segmented',
            labelOn: t('許可'),
            labelOff: t('禁止'),
          },
        },
      ],
    },
  ];
}
