import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ListTree, Play, Search, Settings } from 'lucide-react';
import { MenuBar } from '@base/components/navigation/menu-bar';

export function BottomMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { onClick: () => navigate('/'), icon: Home, label: t('ホーム') },
    { onClick: () => navigate('/resources'), icon: Search, label: t('検索') },
    { icon: ListTree, label: t('ツリー') },
    {
      onClick: () => navigate('/play'),
      icon: Play,
      label: t('プレー'),
      active: location.pathname === '/play',
    },
    { icon: Settings, label: t('設定') },
  ];

  return <MenuBar items={items} align="bottom" />;
}
