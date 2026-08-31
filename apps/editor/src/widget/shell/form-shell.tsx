import { FormProvider, type FieldValues, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { VerticalStacker } from '@base/components/layout/vertical-stacker';
import { DraftModeToggleField } from '@editor/widget/field/draft-mode-toggle-field';
import { SubmitCard } from '@editor/shared/components/form-control/submit-card';
import { CancelCard } from '@editor/shared/components/form-control/cancel-card';

type FormShellProps<TValues extends FieldValues> = {
  form: UseFormReturn<TValues>;
  onSubmit: (values: TValues) => void | Promise<void>;
  withDraftToggle?: boolean;
  children: React.ReactNode;
};

export function FormShell<TValues extends FieldValues>({
  form,
  onSubmit,
  withDraftToggle = false,
  children,
}: FormShellProps<TValues>) {
  const { t } = useTranslation();
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
