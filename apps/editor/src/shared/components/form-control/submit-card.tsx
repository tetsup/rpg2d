import { Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFormState } from 'react-hook-form';
import { ActionCard } from '@base/components/form-control/action-card';

export function SubmitCard() {
  const { t } = useTranslation();
  const { isDirty, isValid, isSubmitting } = useFormState();

  return (
    <ActionCard
      type="submit"
      icon={Save}
      title={isSubmitting ? `${t('保存中')}...` : t('保存')}
      description={t('変更内容を保存する')}
      variant={isDirty ? (isValid ? 'success' : 'error') : 'disabled'}
    />
  );
}
