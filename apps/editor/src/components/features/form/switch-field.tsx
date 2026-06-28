import { Controller, FieldPath, FieldValues, useFormContext } from 'react-hook-form';
import { FieldWrapper, useFieldControlId } from '@editor/components/forms/field-wrapper';
import { Switch } from '@editor/components/ui/switch';

export type SwitchFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  hint?: string;
  disabled?: boolean;
  labelOn?: string;
  labelOff?: string;
};

function SwitchFieldControl<T extends FieldValues>({
  name,
  disabled,
  labelOn,
  labelOff,
}: Pick<SwitchFieldProps<T>, 'name' | 'disabled' | 'labelOn' | 'labelOff'>) {
  const controlId = useFieldControlId();
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className="flex h-10 w-full items-center justify-between gap-4">
          <Switch
            id={controlId}
            size="xl"
            checked={field.value}
            onCheckedChange={field.onChange}
            disabled={disabled}
          />
          <span className="text-muted-foreground text-md whitespace-nowrap">{field.value ? labelOn : labelOff}</span>
        </div>
      )}
    />
  );
}

export function SwitchField<T extends FieldValues>({
  name,
  label,
  hint,
  disabled,
  labelOn = 'ON',
  labelOff = 'OFF',
}: SwitchFieldProps<T>) {
  return (
    <FieldWrapper name={name} label={label} hint={hint}>
      <SwitchFieldControl name={name} disabled={disabled} labelOn={labelOn} labelOff={labelOff} />
    </FieldWrapper>
  );
}
