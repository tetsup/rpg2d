import { Controller, FieldPath, FieldValues, useFormContext } from 'react-hook-form';
import { StyledSwitch, StyledSwitchProps } from '@editor/shared/parts/styled-switch';
import { FieldWrapper, useFieldControlId } from './field-wrapper';

export type SwitchFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  hint?: string;
  disabled?: boolean;
  variant?: Extract<StyledSwitchProps['variant'], 'track' | 'segmented'>;
  labelOn?: string;
  labelOff?: string;
};

function SwitchFieldControl<T extends FieldValues>({
  name,
  disabled,
  variant = 'segmented',
  labelOn,
  labelOff,
}: Pick<SwitchFieldProps<T>, 'name' | 'disabled' | 'variant' | 'labelOn' | 'labelOff'>) {
  const controlId = useFieldControlId();
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <StyledSwitch
          id={controlId}
          variant={variant}
          {...(variant === 'segmented' ? { labelOn, labelOff } : {})}
          checked={field.value}
          onCheckedChange={field.onChange}
          disabled={disabled}
        />
      )}
    />
  );
}

export function SwitchField<T extends FieldValues>({
  name,
  label,
  hint,
  disabled,
  variant = 'segmented',
  labelOn = 'ON',
  labelOff = 'OFF',
}: SwitchFieldProps<T>) {
  return (
    <FieldWrapper name={name} label={label} hint={hint}>
      <SwitchFieldControl name={name} disabled={disabled} variant={variant} labelOn={labelOn} labelOff={labelOff} />
    </FieldWrapper>
  );
}
