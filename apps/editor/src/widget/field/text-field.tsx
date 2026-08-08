import { useFormContext, type FieldValues, type FieldPathByValue } from 'react-hook-form';
import { SingleField } from '@base/components/form-field/single-field';
import { Input } from '@base/components/ui/input';

type TextFieldProps<T extends FieldValues> = {
  name: FieldPathByValue<T, number>;
  label: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
};

export function TextField<T extends FieldValues>({ name, label, hint, error, disabled }: TextFieldProps<T>) {
  const { register } = useFormContext<T>();

  return (
    <SingleField label={label} hint={hint} error={error}>
      <Input type="text" {...register(name)} disabled={disabled} />
    </SingleField>
  );
}
