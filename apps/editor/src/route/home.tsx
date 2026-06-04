import { useTranslation } from 'react-i18next';
import { Settings2, Sparkles } from 'lucide-react';
import { MenuCard } from '@editor/components/parts/menu-card';
import { useHeader } from '@editor/hooks/ui/header';

export function HomePage() {
  const { t } = useTranslation();
  useHeader({ titleKey: 'ホーム' });

  return (
    <div className="space-y-4 p-4">
      <MenuCard icon={Sparkles} title={t('新規作成')} description={t('新しいゲームを作成')} />

      <MenuCard icon={Settings2} title={t('コンフィグ')} description={t('初期設定を変更')} />
    </div>
  );
}
