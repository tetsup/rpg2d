import { Controller, FieldPath, FieldValues, useFormContext } from 'react-hook-form';
import { SingleField } from '@base/components/form-field/single-field';
import { StyledSwitch, type StyledSwitchProps } from '@base/components/form-control/styled-switch';

export type SwitchFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  hint?: string;
  disabled?: boolean;
  variant?: Extract<StyledSwitchProps['variant'], 'track' | 'segmented'>;
  labelOn?: string;
  labelOff?: string;
};

export function SwitchField<T extends FieldValues>({
  name,
  label,
  hint,
  disabled,
  variant = 'segmented',
  labelOn,
  labelOff,
}: SwitchFieldProps<T>) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <SingleField label={label} hint={hint}>
          <StyledSwitch
            variant={variant}
            {...(variant === 'segmented' ? { labelOn, labelOff } : {})}
            checked={field.value}
            onCheckedChange={field.onChange}
            disabled={disabled}
          />
        </SingleField>
      )}
    />
  );
}
