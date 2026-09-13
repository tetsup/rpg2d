import { useFormContext, type FieldValues, type FieldPathByValue } from 'react-hook-form';
import { SingleField } from '@base/components/form-field/single-field';
import { Input } from '@base/components/ui/input';

type TextFieldProps<T extends FieldValues> = {
  name: FieldPathByValue<T, string>;
  label: string;
  hint?: string;
  disabled?: boolean;
};

export function TextField<T extends FieldValues>({ name, label, hint, disabled }: TextFieldProps<T>) {
  const { register, formState } = useFormContext<T>();

  return (
    <SingleField label={label} hint={hint} error={formState.errors[name]?.message?.toString()}>
      <Input type="text" {...register(name)} disabled={disabled} />
    </SingleField>
  );
}
