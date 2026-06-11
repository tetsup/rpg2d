import { ArrowLeft } from 'lucide-react';
import { ActionCard } from './action-card';
import { useTranslation } from 'react-i18next';

export function CancelCard() {
  const { t } = useTranslation();

  return <ActionCard icon={ArrowLeft} title={t('戻る')} description={t('前の画面へ戻る')} variant="warning" />;
}
