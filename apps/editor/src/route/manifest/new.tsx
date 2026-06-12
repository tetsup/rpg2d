import { useTranslation } from 'react-i18next';
import { DefaultValues } from 'react-hook-form';
import z from 'zod';
import { createResourceDocumentSchema } from '@schema/database/resource';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { FormTemplete } from '@editor/components/features/form/form-templete';
import { FieldGroupTemplateProps } from '@editor/components/features/form/field-templete';

type Values = z.infer<typeof ManifestPostParamsSchema>;

export function NewManifestPage() {
  const { t } = useTranslation();
  const fields: FieldGroupTemplateProps<Values>[] = [
    {
      title: t('プロジェクト概要'),
      items: [
        { name: 'namespace', label: t('グループ'), type: 'select-namespace', permission: 'create' },
        { name: 'name', label: t('プロジェクト名'), type: 'text' },
        { name: 'description', label: t('プロジェクトの説明'), type: 'text' },
      ],
    },
    {
      title: t('初期状態'),
      items: [
        { name: 'initialState.field', label: t('フィールド'), type: 'select-resource', resourceType: 'field' },
        {
          name: 'initialState.playerPos',
          label: t('プレイヤー位置'),
          type: 'plck-field-position',
          refField: 'initialState.field',
        },
      ],
    },
  ];
  const defaultValues: DefaultValues<Values> = {};

  return (
    <LayoutShell titleBarProps={{ title: t('プロジェクト設定') }}>
      <FormTemplete
        fieldGroups={fields}
        schema={createResourceDocumentSchema('manifest')}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
      />
    </LayoutShell>
  );
}
