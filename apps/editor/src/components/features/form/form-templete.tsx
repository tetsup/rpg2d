import type z from 'zod';
import { FieldValues, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitCard } from '@editor/components/parts/submit-card';
import { CancelCard } from '@editor/components/parts/cancel-card';
import { FieldGroupTemplate, FieldGroupTemplateProps } from './field-templete';

type FormTempleteProps = {
  fieldGroups: FieldGroupTemplateProps[];
  schema: z.ZodType<unknown, FieldValues>;
};

export function FormTemplete({ fieldGroups, schema }: FormTempleteProps) {
  const form = useForm({ resolver: zodResolver(schema) });

  return (
    <form {...form}>
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
