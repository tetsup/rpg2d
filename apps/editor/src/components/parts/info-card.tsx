import type { LucideIcon } from 'lucide-react';
import { Sparkles } from 'lucide-react';

type InfoCardProps = {
  icon?: LucideIcon;
  title: string;
  children: React.ReactNode;
};

export function InfoCard({ icon: Icon = Sparkles, title, children }: InfoCardProps) {
  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-2xl
        border
        bg-card
        p-5
        shadow-sm
      "
    >
      <div
        className="
          absolute
          top-0
          left-0
          h-1
          w-full
          bg-primary/40
        "
      />
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div
        className="
          mt-3
          text-sm
          leading-relaxed
          text-muted-foreground
        "
      >
        {children}
      </div>
    </div>
  );
}
