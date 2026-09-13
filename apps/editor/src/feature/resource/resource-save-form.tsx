import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { UseFormReturn } from 'react-hook-form';
import type { ResourceInput } from '@sharedTypes/database/collection';
import { TextField } from '@editor/widget/field/text-field';
import { FormShell } from '@editor/widget/shell/form-shell';

type ResourceSaveFormProps<T extends ResourceInput<any>> = {
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void | Promise<void>;
  additionalField?: ReactNode;
};

export function ResourceSaveForm({ form, onSubmit, additionalField }: ResourceSaveFormProps<any>) {
  const { t } = useTranslation();
  return (
    <FormShell form={form} onSubmit={onSubmit}>
      <TextField name="namespace" label={t('グループ')} />
      <TextField name="name" label={t('イメージ名')} />
      <TextField name="description" label={t('説明')} />
      {additionalField}
    </FormShell>
  );
}
