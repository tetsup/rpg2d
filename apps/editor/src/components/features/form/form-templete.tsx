import type z from 'zod';
import { DefaultValues, FieldValues, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitCard } from '@editor/components/parts/submit-card';
import { CancelCard } from '@editor/components/parts/cancel-card';
import { DraftModeToggle } from './draft-mode-toggle';
import { FieldGroupTemplate, FieldGroupTemplateProps } from './field-templete';
import { useEffect } from 'react';

type FormTemplateProps<TValues extends FieldValues> = {
  fieldGroups: FieldGroupTemplateProps<TValues>[];
  schema: z.ZodType<TValues, TValues>;
  defaultValues: DefaultValues<TValues>;
  onSubmit: (values: TValues) => Promise<void>;
  withDraftToggle?: boolean;
};

export function FormTemplete<TValues extends FieldValues>({
  fieldGroups,
  schema,
  onSubmit,
  defaultValues,
  withDraftToggle = false,
}: FormTemplateProps<TValues>) {
  const { t } = useTranslation();
  const form = useForm({ resolver: zodResolver(schema), mode: 'onChange', defaultValues });

  useEffect(() => {
    if (defaultValues) form.reset(defaultValues);
  }, [defaultValues]);

  return (
    <form
      onSubmit={form.handleSubmit(async (data) => {
        try {
          await onSubmit(data);
          toast.success(t('保存しました'));
        } catch (e) {
          console.error(e);
          toast.error(`${t('保存に失敗しました')}: ${(e as Error).message}`, { position: 'top-center' });
        }
      })}
    >
      <FormProvider {...form}>
        <div className="space-y-4">
          {fieldGroups.map((fieldGroup, index) => (
            <FieldGroupTemplate key={index} {...fieldGroup} />
          ))}
          {withDraftToggle && <DraftModeToggle />}
          <SubmitCard />
          <CancelCard />
        </div>
      </FormProvider>
    </form>
  );
}
