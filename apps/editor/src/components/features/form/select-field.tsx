import type { ReactNode } from 'react';
import { Controller, FieldPath, FieldValues, useFormContext } from 'react-hook-form';
import { FieldWrapper } from '@editor/components/forms/field-wrapper';
import { Select } from '@editor/components/ui/select';

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

export function SelectField<T extends FieldValues>({ name, label, hint, items }: SelectFieldProps<T>) {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FieldWrapper name={name} label={label} hint={hint}>
          <Select value={field.value} onValueChange={field.onChange} items={items} />
        </FieldWrapper>
      )}
    />
  );
}
