import { useTranslation } from 'react-i18next';
import { LogOut, Settings, Languages } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchGetApi } from '@editor/lib/api/get';
import { UserMenuSkeleton } from '@editor/components/skeletons/user-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@editor/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@editor/components/ui/avatar';
import { Button } from '@editor/components/ui/button';

type User = {
  presenceName: string;
  email: string;
};

export function UserMenu() {
  const { t } = useTranslation();
  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => fetchGetApi<{}, User>('/api/auth/me'),
  });
  const onLogout = () => {
    window.location.href = '/api/auth/logout';
  };
  const initials = (user?.presenceName ?? '')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return user ? (
    <DropdownMenu>
      <DropdownMenuTrigger
        render=<Button variant="ghost" className="h-10 px-2 flex items-center gap-2 rounded-md border">
          <Avatar className="h-7 w-7 rounded-none">
            <AvatarFallback className="rounded-none text-xs">{initials}</AvatarFallback>
          </Avatar>

          <div className="text-left leading-tight">
            <div className="text-xs font-medium">{user.presenceName}</div>
            <div className="text-[10px] text-muted-foreground">{user?.email}</div>
          </div>
        </Button>
      />
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem>
          <Settings className="w-4 h-4 mr-2" />
          {t('ユーザー設定')}
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Languages className="w-4 h-4 mr-2" />
          {t('言語設定')}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          {t('ログアウト')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <UserMenuSkeleton />
  );
}
