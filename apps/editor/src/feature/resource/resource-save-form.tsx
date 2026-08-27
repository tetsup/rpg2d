import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SubmitCard } from '@editor/shared/components/form-control/submit-card';
import { TextField } from '@editor/widget/field/text-field';

type ResourceSaveFormProps = {
  additionalField?: ReactNode;
};

export function ResourceSaveForm({ additionalField }: ResourceSaveFormProps) {
  const { t } = useTranslation();
  return (
    <>
      <TextField name="namespace" label={t('グループ')} />
      <TextField name="name" label={t('イメージ名')} />
      <TextField name="description" label={t('説明')} />
      {additionalField}
      <SubmitCard />
    </>
  );
}
