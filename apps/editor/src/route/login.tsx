import { LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { MenuCard } from '@editor/components/parts/menu-card';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export function LoginPage() {
  const { t } = useTranslation();
  const handleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/login`;
  };

  return (
    <LayoutShell titleBarProps={{ title: t('ログイン') }}>
      <MenuCard onClick={() => handleLogin()} icon={LogIn} title={t('Auth0でログイン')} />
    </LayoutShell>
  );
}
