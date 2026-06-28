import { FieldPath, FieldValues, useFormContext } from 'react-hook-form';
import { FieldWrapper, useFieldControlId } from '@editor/components/forms/field-wrapper';
import { Input } from '@editor/components/ui/input';

export type InputFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  hint?: string;
  disabled?: boolean;
};

function InputFieldControl<T extends FieldValues>({
  name,
  disabled,
}: Pick<InputFieldProps<T>, 'name' | 'disabled'>) {
  const controlId = useFieldControlId();
  const { register } = useFormContext();
  return <Input {...register(name)} id={controlId} className="w-full" type="text" disabled={disabled} />;
}

export function InputField<T extends FieldValues>({ name, label, hint, disabled }: InputFieldProps<T>) {
  return (
    <FieldWrapper name={name} label={label} hint={hint}>
      <InputFieldControl name={name} disabled={disabled} />
    </FieldWrapper>
  );
}
