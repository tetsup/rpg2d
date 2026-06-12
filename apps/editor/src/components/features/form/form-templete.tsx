import type z from 'zod';
import { FieldValues, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitCard } from '@editor/components/parts/submit-card';
import { CancelCard } from '@editor/components/parts/cancel-card';
import { FieldGroupTemplate, FieldGroupTemplateProps } from './field-templete';

type FormTempleteProps<T extends FieldValues> = {
  fieldGroups: FieldGroupTemplateProps[];
  schema: z.ZodType<unknown, T>;
  onSubmit: (data: T) => void;
  defaultValues: T;
};

export function FormTemplete({ fieldGroups, schema, onSubmit, defaultValues }: FormTempleteProps<any>) {
  const form = useForm({ resolver: zodResolver(schema), mode: 'onChange', defaultValues: defaultValues });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormProvider {...form}>
        <div className="space-y-4">
          {fieldGroups.map((fieldGroup) => (
            <FieldGroupTemplate {...fieldGroup} />
          ))}
          <SubmitCard />
          <CancelCard />
        </div>
      </FormProvider>
    </form>
  );
}
