import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ListTree, Play, Search, Settings } from 'lucide-react';
import { MenuBar } from '@editor/components/parts/menu-bar';

export function BottomMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const items = [
    { onClick: () => navigate('/'), icon: Home, label: t('ホーム') },
    { icon: Search, label: t('検索') },
    { icon: ListTree, label: t('ツリー') },
    { icon: Play, label: t('プレー') },
    { icon: Settings, label: t('設定') },
  ];

  return <MenuBar items={items} align="bottom" />;
}
