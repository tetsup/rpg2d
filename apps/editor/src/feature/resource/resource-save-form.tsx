import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FieldValues, FormProvider, UseFormReturn } from 'react-hook-form';
import { SubmitCard } from '@editor/shared/components/form-control/submit-card';
import { TextField } from '@editor/widget/field/text-field';

type ResourceSaveFormProps<T extends FieldValues = any> = {
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void;
  additionalField?: ReactNode;
};

export function ResourceSaveForm({ form, onSubmit, additionalField }: ResourceSaveFormProps) {
  const { t } = useTranslation();
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="contents">
      <FormProvider {...form}>
        <TextField name="namespace" label={t('グループ')} />
        <TextField name="name" label={t('イメージ名')} />
        <TextField name="description" label={t('説明')} />
        {additionalField}
        <SubmitCard />
      </FormProvider>
    </form>
  );
}
