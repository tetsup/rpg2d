import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ActionCard } from './action-card';

export function CancelCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <ActionCard
      onClick={() => navigate(-1)}
      icon={ArrowLeft}
      title={t('戻る')}
      description={t('前の画面へ戻る')}
      variant="warning"
    />
  );
}
