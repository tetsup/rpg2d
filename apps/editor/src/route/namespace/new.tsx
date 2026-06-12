import { useTranslation } from 'react-i18next';
import z from 'zod';
import { NamespacePostParamsSchema } from '@schema/api/namespace';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { FormTemplete } from '@editor/components/features/form/form-templete';
import { FieldGroupTemplateProps } from '@editor/components/features/form/field-templete';
import { fetchPostApi } from '@editor/lib/api/post';

type Values = z.infer<typeof NamespacePostParamsSchema>;

export function NewNamespacePage() {
  const { t } = useTranslation();
  const fields: FieldGroupTemplateProps[] = [
    {
      title: t('グループ設定'),
      items: [
        { name: 'id', label: t('ID'), type: 'text' },
        { name: 'displayName', label: t('グループ名'), type: 'text' },
        { name: 'description', label: t('グループの説明'), type: 'text' },
        { name: 'private', label: t('非公開'), type: 'switch' },
      ],
    },
  ];

  const defaultValues: Values = {
    id: '',
    displayName: '',
    description: '',
    isPrivate: false,
  };

  const onSubmit = (values: Values) => {
    fetchPostApi('/api/namespace', values);
  };

  return (
    <LayoutShell titleBarProps={{ title: t('グループ作成') }}>
      <FormTemplete
        fieldGroups={fields}
        schema={NamespacePostParamsSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
      />
    </LayoutShell>
  );
}
