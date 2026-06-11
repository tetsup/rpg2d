import { Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ActionCard } from './action-card';
import { useFormState } from 'react-hook-form';

export function SubmitCard() {
  const { t } = useTranslation();
  const state = useFormState();

  return (
    <ActionCard
      icon={Save}
      title={t('保存')}
      description={t('変更内容を保存する')}
      variant={state.isDirty ? (state.isValid ? 'success' : 'error') : 'disabled'}
      disabled={!state.isValid}
    />
  );
}
