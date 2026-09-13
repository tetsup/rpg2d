import type { ReactNode } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { ResourceInput } from '@sharedTypes/database/collection';
import { FormShell } from '@editor/widget/shell/form-shell';
import { ResourceCommonSection } from './resource-common-section';

type ResourceSaveFormProps<T extends ResourceInput<any>> = {
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void | Promise<void>;
  additionalField?: ReactNode;
};

export function ResourceSaveForm({ form, onSubmit, additionalField }: ResourceSaveFormProps<any>) {
  return (
    <FormShell form={form} onSubmit={onSubmit}>
      <ResourceCommonSection />
      {additionalField}
    </FormShell>
  );
}
