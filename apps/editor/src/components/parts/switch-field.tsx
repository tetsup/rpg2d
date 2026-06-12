import { Switch } from '@editor/components/ui/switch';
import { cn } from '@editor/lib/utils';

type SwitchFieldProps = {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  labelOn?: string;
  labelOff?: string;
};

export function SwitchField({
  checked = false,
  onCheckedChange,
  disabled,
  className,
  labelOn = 'ON',
  labelOff = 'OFF',
}: SwitchFieldProps) {
  return (
    <div className={cn('flex h-10 w-full items-center justify-between gap-4', className)}>
      <Switch size="xl" checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />

      <span className="text-muted-foreground text-md whitespace-nowrap">{checked ? labelOn : labelOff}</span>
    </div>
  );
}
