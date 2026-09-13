import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ResourceInput } from '@sharedTypes/database/collection';
import type { ResourceType } from '@sharedTypes/resource/common';
import { resourceRepository } from '@editor/shared/repository/resource-repository';
import { PageShell } from '@editor/widget/shell/page-shell';
import { useResource } from '@editor/factory/resource';

type RenderFormProps<T extends ResourceType> = {
  defaultValues: ResourceInput<T>;
  onSubmit: (data: ResourceInput<T>) => Promise<void> | void;
};

type NewResourcePageProps<T extends ResourceType> = {
  type: T;
  title: string;
  renderForm: (props: RenderFormProps<T>) => ReactNode;
  flush?: boolean;
};

export function NewResourcePage<T extends ResourceType>({
  type,
  title,
  renderForm,
  flush = false,
}: NewResourcePageProps<T>) {
  const navigate = useNavigate();
  const defaultValues = useResource({ type });
  const onSubmit = async (values: ResourceInput<T>) => {
    await resourceRepository.create(values);
    navigate('/');
  };

  return (
    <PageShell flush={flush} titleBarProps={{ title }}>
      {renderForm({ defaultValues, onSubmit })}
    </PageShell>
  );
}
