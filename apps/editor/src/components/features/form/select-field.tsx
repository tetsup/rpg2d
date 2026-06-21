import { Controller, FieldPath, FieldValues, useFormContext } from 'react-hook-form';
import { FieldWrapper } from '@editor/components/forms/field-wrapper';
import { Select } from '@editor/components/ui/select';

export type SelectFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  hint?: string;
  items: T[];
};

export function SelectField({ name, label, hint, items }: SelectFieldProps<any>) {
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
