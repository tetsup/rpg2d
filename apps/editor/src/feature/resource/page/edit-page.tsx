import { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ResourceInput } from '@sharedTypes/database/collection';
import type { ResourceType } from '@sharedTypes/resource/common';
import { FormSkeleton } from '@base/components/form-field/form-skeleton';
import { resourceRepository } from '@editor/shared/repository/resource-repository';
import { PageShell } from '@editor/widget/shell/page-shell';

type RenderFormProps<T extends ResourceType> = {
  defaultValues: ResourceInput<T>;
  onSubmit: (data: ResourceInput<T>) => Promise<void> | void;
};

type EditResourcePageProps<T extends ResourceType> = {
  type: T;
  title: string;
  renderForm: (props: RenderFormProps<T>) => ReactNode;
  flush?: boolean;
};

export function EditResourcePage<T extends ResourceType>({
  type,
  title,
  renderForm,
  flush = false,
}: EditResourcePageProps<T>) {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  const resourceId = `${namespace}/${type}/${name}`;
  const navigate = useNavigate();
  const { data: defaultValues, isSuccess } = resourceRepository.useById(resourceId);
  const onSubmit = async (data: ResourceInput<T>) => {
    await resourceRepository.update(resourceId, data);
    navigate('/');
  };

  if (namespace == null || name == null) throw new Error('bad request');

  return (
    <PageShell flush={flush} titleBarProps={{ title }}>
      {isSuccess ? renderForm({ defaultValues, onSubmit }) : <FormSkeleton />}
    </PageShell>
  );
}
