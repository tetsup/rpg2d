import type { LucideIcon } from 'lucide-react';
import { CardButton } from './card-button';

type MenuCardProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export function MenuCard({ icon: Icon, title, description, onClick, disabled }: MenuCardProps) {
  return (
    <CardButton onClick={onClick} disabled={disabled}>
      <div
        className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-xl
            bg-primary/10
            text-primary
          "
      >
        <Icon size={28} strokeWidth={2} />
      </div>
      <div className="flex-1">
        <div className="font-semibold">{title}</div>

        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
    </CardButton>
  );
}
