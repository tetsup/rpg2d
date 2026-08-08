import { useEffect } from 'react';
import { DefaultValues, FieldValues, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type z from 'zod';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { VerticalStacker } from '@base/components/layout/vertical-stacker';
import { DraftModeToggleField } from '../field/draft-mode-toggle-field';
import { SubmitCard } from '../../shared/components/form-control/submit-card';
import { CancelCard } from '../../shared/components/form-control/cancel-card';

type FormShellProps<TValues extends FieldValues> = {
  schema: z.ZodType<TValues, TValues>;
  defaultValues: DefaultValues<TValues>;
  onSubmit: (values: TValues) => Promise<void>;
  withDraftToggle?: boolean;
  children: React.ReactNode;
};

export function FormShell<TValues extends FieldValues>({
  schema,
  onSubmit,
  defaultValues,
  withDraftToggle = false,
  children,
}: FormShellProps<TValues>) {
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
        <VerticalStacker>
          {children}
          {withDraftToggle && <DraftModeToggleField />}
          <SubmitCard />
          <CancelCard />
        </VerticalStacker>
      </FormProvider>
    </form>
  );
}
