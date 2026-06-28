import { useId } from 'react';
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
  const titleId = useId();
  const descriptionId = useId();

  return (
    <CardButton
      onClick={onClick}
      disabled={disabled}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
    >
      <div
        aria-hidden="true"
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
        <span id={titleId} className="block font-semibold">
          {title}
        </span>
        {description ? (
          <span id={descriptionId} className="block text-sm text-muted-foreground">
            {description}
          </span>
        ) : null}
      </div>
    </CardButton>
  );
}
