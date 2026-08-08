import { AppDropdownMenu } from '@base/components/navigation/dropdown-menu';
import { UserIndicator } from '@base/components/navigation/user-indicator';
import { UserMenuSkeleton } from '@base/components/navigation/user-menu-skeleton';
import { useUserMenu } from './use-user-menu';

export function UserMenu() {
  const { status, user, initials, groups } = useUserMenu();

  if (status === 'loading' || !user) {
    return <UserMenuSkeleton />;
  }

  return (
    <AppDropdownMenu
      trigger={<UserIndicator initials={initials} name={user.presenceName} email={user.email ?? ''} />}
      groups={groups}
    />
  );
}
