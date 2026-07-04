import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ListTree, Play, Search, Settings } from 'lucide-react';
import { MenuBar } from '@editor/components/parts/menu-bar';
import { PLAY_PATH } from '@editor/lib/play/navigation';

export function BottomMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { onClick: () => navigate('/'), icon: Home, label: t('ホーム') },
    { onClick: () => navigate('/resources'), icon: Search, label: t('検索') },
    { icon: ListTree, label: t('ツリー') },
    {
      onClick: () => navigate(PLAY_PATH),
      icon: Play,
      label: t('プレー'),
      active: location.pathname === PLAY_PATH,
    },
    { icon: Settings, label: t('設定') },
  ];

  return <MenuBar items={items} align="bottom" />;
}
