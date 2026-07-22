import type { ReactNode } from 'react';
import { Controller, FieldPath, FieldValues, useFormContext } from 'react-hook-form';
import { Select } from '@base/components/ui/select';
import { FieldWrapper, useFieldControlId } from './field-wrapper';

export type SelectFieldOption = {
  label: ReactNode;
  value: string;
};

export type SelectFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  hint?: string;
  items: SelectFieldOption[];
};

function SelectFieldControl<T extends FieldValues>({ name, items }: Pick<SelectFieldProps<T>, 'name' | 'items'>) {
  const controlId = useFieldControlId();
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => <Select id={controlId} value={field.value} onValueChange={field.onChange} items={items} />}
    />
  );
}

export function SelectField<T extends FieldValues>({ name, label, hint, items }: SelectFieldProps<T>) {
  return (
    <FieldWrapper name={name} label={label} hint={hint}>
      <SelectFieldControl name={name} items={items} />
    </FieldWrapper>
  );
}
