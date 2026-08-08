import { useTranslation } from 'react-i18next';
import { Languages, LogOut, Settings } from 'lucide-react';
import type { DropdownMenuItemData } from '@base/components/navigation/dropdown-menu';
import { useAuth } from '../../shared/providers/auth';

export function useUserMenu() {
  const { t } = useTranslation();
  const { status, user } = useAuth();

  const initials = (user?.presenceName ?? '')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const logout = () => {
    window.location.href = '/api/auth/logout';
  };

  const groups: DropdownMenuItemData[][] = [
    [
      {
        icon: Settings,
        label: t('ユーザー設定'),
      },
      {
        icon: Languages,
        label: t('言語設定'),
      },
    ],
    [
      {
        icon: LogOut,
        label: t('ログアウト'),
        onClick: logout,
      },
    ],
  ];

  return {
    status,
    user,
    initials,
    groups,
  };
}
