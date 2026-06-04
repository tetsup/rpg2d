import type { LucideIcon } from 'lucide-react';

type MenuCardProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  onClick?: () => void;
};

export function MenuCard({ icon: Icon, title, description, onClick }: MenuCardProps) {
  return (
    <button
      onClick={onClick}
      className="
        w-full
        rounded-2xl
        border
        bg-card
        p-5
        text-left
      "
    >
      <div className="flex items-center gap-4">
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
      </div>
    </button>
  );
}
