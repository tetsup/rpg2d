import { FieldPath, FieldValues, useFormContext } from 'react-hook-form';
import { FieldWrapper } from '@editor/components/forms/field-wrapper';
import { Input } from '@editor/components/ui/input';

export type InputFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  hint?: string;
  disabled?: boolean;
};

export function InputField<T extends FieldValues>({ name, label, hint, disabled }: InputFieldProps<T>) {
  const { register } = useFormContext();
  return (
    <FieldWrapper name={name} label={label} hint={hint}>
      <Input {...register(name)} className="w-full" type="text" disabled={disabled} />
    </FieldWrapper>
  );
}
