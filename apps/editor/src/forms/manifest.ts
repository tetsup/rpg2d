import { useTranslation } from 'react-i18next';
import { createResourceInputSchema } from '@schema/database/resource';
import type { FieldGroupTemplateProps } from '@editor/components/features/form/field-templete';
import { ResourceInput } from '@sharedTypes/database/collection';

type ManifestFieldParams = { mode: 'create' | 'update' };

export const manifestInputSchema = createResourceInputSchema('manifest');

export function createManifestDefaultValues(): ResourceInput<'manifest'> {
  return {
    namespace: '',
    type: 'manifest',
    name: '',
    version: 0,
    description: '',
    isDraft: true,
    data: {
      initialState: {
        core: { players: [], variables: {}, mode: 'field' },
        field: { fieldId: null, pos: { x: 0, y: 0 }, direction: 'down', actionIds: [] },
      },
      schemas: { playerState: {} },
      config: {
        blockSize: { width: 16, height: 16 },
        textSize: { width: 7, height: 7 },
        moveDurationMs: 500,
        screen: { width: 320, height: 240 },
        defaultMessagePanel: null,
        messageConfig: { speedMs: 100, margin: { left: 0, top: 0, right: 1, bottom: 1 } },
      },
    },
  };
}

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
            label: t('マップ'),
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
            label: t('パネル'),
            collectionName: 'resources',
            resourceType: 'panel',
          },
        },
      ],
    },
  ];
}
