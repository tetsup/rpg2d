import { useFormContext, type FieldValues, type FieldPathByValue } from 'react-hook-form';
import { SingleField } from '@base/components/form-field/single-field';
import { Input } from '@base/components/ui/input';

type NumberFieldProps<T extends FieldValues> = {
  name: FieldPathByValue<T, number>;
  label: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
};

export function NumberField<T extends FieldValues>({ name, label, hint, error, disabled }: NumberFieldProps<T>) {
  const { register } = useFormContext<T>();

  return (
    <SingleField label={label} hint={hint} error={error}>
      <Input
        type="number"
        {...register(name, {
          valueAsNumber: true,
        })}
        disabled={disabled}
      />
    </SingleField>
  );
}
