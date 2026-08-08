import type { LucideIcon } from 'lucide-react';
import { VerticalStacker } from '../layout/vertical-stacker';

type FormSectionProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
};

export function FormSection({ title, description, icon: Icon, children }: FormSectionProps) {
  return (
    <section
      className="
        rounded-2xl
        border
        bg-card
        p-5
        shadow-sm
      "
    >
      <div className="mb-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-primary" />}
          <h2 className="font-semibold">{title}</h2>
        </div>
        {description && (
          <p
            className="
              mt-1
              text-sm
              text-muted-foreground
            "
          >
            {description}
          </p>
        )}
      </div>
      <VerticalStacker>{children}</VerticalStacker>
    </section>
  );
}
