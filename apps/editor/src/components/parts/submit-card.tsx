import { Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFormState } from 'react-hook-form';
import { ActionCard } from './action-card';

export function SubmitCard() {
  const { t } = useTranslation();
  const { isDirty, isValid } = useFormState();

  return (
    <>
      <ActionCard
        icon={Save}
        title={t('保存')}
        description={t('変更内容を保存する')}
        variant={isDirty ? (isValid ? 'success' : 'error') : 'disabled'}
        disabled={!isValid || !isDirty}
      />
    </>
  );
}
