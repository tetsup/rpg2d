import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@editor/shared/providers/auth';
import { Backdrop } from '@base/components/feedback/backdrop';

export function RequireAuth() {
  const { status } = useAuth();

  if (status === 'loading') return <Backdrop open={true} />;
  if (status === 'unauthenticated') return <Navigate to="/login" replace />;
  return <Outlet />;
}
