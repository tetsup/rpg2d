import type { ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ResourceType } from '@sharedTypes/resource/common';
import type { ResourceInput } from '@sharedTypes/database/collection';
import { formatResourceId } from '@schema/resource/common/base';
import { useAlert } from '@editor/shared/providers/alert';
import { resourceRepository } from '@editor/shared/repository/resource-repository';
import { SubmitCard } from '@editor/shared/components/form-control/submit-card';
import { useErrorHandler } from '@editor/widget/notification/error-handler';
import { TextField } from '@editor/widget/field/text-field';

type ResourceSaveFormProps = {
  additionalField?: ReactNode;
};

export function ResourceSaveForm<T extends ResourceType>({ additionalField }: ResourceSaveFormProps) {
  const { t } = useTranslation();
  const form = useFormContext<ResourceInput<T>>();
  const navigate = useNavigate();
  const alert = useAlert();
  const errorHandler = useErrorHandler(form, alert);

  const onSubmit = (data: ResourceInput<T>) => {
    errorHandler(async () => {
      const old = form.formState.defaultValues;
      if (old?.namespace && old?.type && old?.name)
        await resourceRepository.update(
          formatResourceId({ namespace: old.namespace, type: old.type, name: old.name }),
          data
        );
      else await resourceRepository.create(data);
      navigate(`/resources/${formatResourceId(data)}`);
    });
  };
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <TextField name="namespace" label={t('グループ')} />
      <TextField name="name" label={t('イメージ名')} />
      <TextField name="description" label={t('説明')} />
      {additionalField}
      <SubmitCard />
    </form>
  );
}
