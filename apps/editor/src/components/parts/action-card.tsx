import type { LucideIcon } from 'lucide-react';

type ActionCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
  variant?: 'success' | 'warning' | 'error' | 'disabled';
  disabled?: boolean;
};

const variants = {
  success: {
    icon: 'bg-emerald-500/10 text-emerald-500',
    border: 'border-emerald-500/20',
  },
  warning: {
    icon: 'bg-amber-500/10 text-amber-500',
    border: 'border-amber-500/20',
  },
  error: {
    icon: 'bg-red-500/10 text-red-500',
    border: 'border-red-500/20',
  },
  disabled: {
    icon: 'bg-gray-500/10 text-gray-500',
    border: 'border-gray-500/20',
  },
};

export function ActionCard({
  icon: Icon,
  title,
  description,
  onClick,
  variant = 'success',
  disabled = false,
}: ActionCardProps) {
  const style = variants[variant];

  return (
    <button
      onClick={onClick}
      className={`
        w-full
        rounded-2xl
        border
        bg-card
        p-5
        text-left
        shadow-sm
        transition-all
        active:scale-[0.98]
        ${style.border}
      `}
      disabled={disabled}
    >
      <div className="flex items-center gap-4">
        <div
          className={`
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-xl
            ${style.icon}
          `}
        >
          <Icon className="h-8 w-8" />
        </div>
        <div className="flex-1">
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
      </div>
    </button>
  );
}
