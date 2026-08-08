import { LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MenuCard } from '@base/components/form-control/menu-card';
import { PageShell } from '@editor/widget/shell/page-shell';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export function LoginPage() {
  const { t } = useTranslation();
  const handleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/login`;
  };

  return (
    <PageShell titleBarProps={{ title: t('ログイン') }}>
      <MenuCard onClick={() => handleLogin()} icon={LogIn} title={t('Auth0でログイン')} />
    </PageShell>
  );
}
