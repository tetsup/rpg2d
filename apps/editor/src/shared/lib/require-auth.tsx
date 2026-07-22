import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../providers/auth';
import { Backdrop } from '../parts/backdrop';

export function RequireAuth() {
  const { status } = useAuth();

  if (status === 'loading') return <Backdrop open={true} />;
  if (status === 'unauthenticated') return <Navigate to="/login" replace />;
  return <Outlet />;
}
