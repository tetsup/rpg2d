import { Controller, FieldPath, FieldValues, useFormContext } from 'react-hook-form';
import { FieldWrapper } from '@editor/components/forms/field-wrapper';
import { Switch } from '@editor/components/ui/switch';

export type SwitchFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  hint?: string;
  disabled?: boolean;
  labelOn?: string;
  labelOff?: string;
};

export function SwitchField<T extends FieldValues>({
  name,
  label,
  hint,
  disabled,
  labelOn = 'ON',
  labelOff = 'OFF',
}: SwitchFieldProps<T>) {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FieldWrapper name={name} label={label} hint={hint}>
          <div className="flex h-10 w-full items-center justify-between gap-4">
            <Switch size="xl" checked={field.value} onCheckedChange={field.onChange} disabled={disabled} />

            <span className="text-muted-foreground text-md whitespace-nowrap">{field.value ? labelOn : labelOff}</span>
          </div>
        </FieldWrapper>
      )}
    />
  );
}
