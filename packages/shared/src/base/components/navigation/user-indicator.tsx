import { Avatar, AvatarFallback } from '@base/components/ui/avatar';

export type UserIndicatorProps = {
  initials: string;
  name: string;
  email: string;
};

export function UserIndicator({ initials, name, email }: UserIndicatorProps) {
  return (
    <div className="flex h-10 items-center gap-2 rounded-md border px-2">
      <Avatar className="h-7 w-7 rounded-none">
        <AvatarFallback className="rounded-none text-xs">{initials}</AvatarFallback>
      </Avatar>

      <div className="text-left leading-tight">
        <div className="text-xs font-medium">{name}</div>

        <div className="text-[10px] text-muted-foreground">{email}</div>
      </div>
    </div>
  );
}
