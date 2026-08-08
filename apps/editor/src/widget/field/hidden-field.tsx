import { useFormContext, type FieldValues, type FieldPathByValue } from 'react-hook-form';

type HiddenFieldProps<T extends FieldValues> = {
  name: FieldPathByValue<T, number>;
};

export function HiddenField<T extends FieldValues>({ name }: HiddenFieldProps<T>) {
  const { register } = useFormContext<T>();

  return <input type="hidden" {...register(name)} />;
}
