import { cn } from '@editor/lib/utils';

const sizeClasses = {
  sm: 'h-[14px] w-[24px] after:size-3',
  default: 'h-[18.4px] w-[32px] after:size-4',
  lg: 'h-[23px] w-[40px] after:size-5',
  xl: 'h-[28px] w-[48px] after:size-6',
} as const;

type StyledSwitchSize = keyof typeof sizeClasses;

type StyledSwitchProps = {
  id?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: StyledSwitchSize;
  className?: string;
};

export function StyledSwitch({
  id,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled = false,
  size = 'default',
  className,
}: StyledSwitchProps) {
  return (
    <span className={cn('relative inline-flex shrink-0 items-center', className)}>
      <input
        type="checkbox"
        role="switch"
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={(event) => onCheckedChange?.(event.currentTarget.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          'relative inline-flex shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-input transition-colors outline-none',
          'after:pointer-events-none after:block after:rounded-full after:bg-background after:transition-transform',
          'after:translate-x-0 peer-checked:after:translate-x-[calc(100%-2px)]',
          'peer-focus-visible:border-ring peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50',
          'peer-checked:bg-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
          'dark:bg-input/80 dark:peer-checked:bg-primary dark:peer-checked:after:bg-primary-foreground dark:after:bg-foreground',
          sizeClasses[size]
        )}
      />
    </span>
  );
}
