import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ListTree, Play, Search, Settings } from 'lucide-react';
import { MenuBar } from '@editor/components/parts/menu-bar';
import { ManifestPickerDialog } from '@editor/components/features/play/manifest-picker-dialog';
import { useWorkspaceStore } from '@editor/stores/workspace';

export function BottomMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const manifestId = useWorkspaceStore((s) => s.current.manifestId);
  const setWorkspace = useWorkspaceStore((s) => s.setCurrent);
  const [pickerOpen, setPickerOpen] = useState(false);

  const openPlay = (id?: string) => {
    const target = id ?? manifestId;
    if (target) {
      navigate(`/play?manifest=${encodeURIComponent(target)}`);
      return;
    }
    setPickerOpen(true);
  };

  const items = [
    { onClick: () => navigate('/'), icon: Home, label: t('ホーム') },
    { onClick: () => navigate('/resources'), icon: Search, label: t('検索') },
    { icon: ListTree, label: t('ツリー') },
    {
      onClick: () => openPlay(),
      icon: Play,
      label: t('プレー'),
      active: location.pathname === '/play',
    },
    { icon: Settings, label: t('設定') },
  ];

  return (
    <>
      <MenuBar items={items} align="bottom" />
      <ManifestPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(id) => {
          setWorkspace({ manifestId: id });
          navigate(`/play?manifest=${encodeURIComponent(id)}`);
        }}
      />
    </>
  );
}
