import { cn } from '@base/lib/utils';

export function CardButton({ children, className, ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      {...props}
      className={cn(
        `
        w-full
        rounded-2xl
        border
        bg-card
        p-5
        text-left
        cursor-pointer
        enabled:hover:bg-accent
        enabled:hover:text-accent-foreground
        enabled:hover:ring-2
        enabled:hover:ring-primary
        disabled:cursor-not-allowed
      `,
        className
      )}
    >
      <div className="flex items-center gap-4">{children}</div>
    </button>
  );
}
