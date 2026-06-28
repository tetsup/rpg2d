import { FieldPath, FieldValues, useFormContext } from 'react-hook-form';
import { FieldWrapper } from '@editor/components/forms/field-wrapper';
import { Input } from '@editor/components/ui/input';

export type FieldPosFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  hint?: string;
  disabled?: boolean;
};

export function FieldPosField<T extends FieldValues>({ name, label, hint, disabled }: FieldPosFieldProps<T>) {
  const { register } = useFormContext();
  return (
    <FieldWrapper name={name} label={label} hint={hint}>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <label className="w-4 text-sm">x</label>
          <Input {...register(`${name}.x`)} disabled={disabled} />
        </div>
        <div className="flex items-center gap-2">
          <label className="w-4 text-sm">y</label>
          <Input {...register(`${name}.y`)} disabled={disabled} />
        </div>
      </div>
    </FieldWrapper>
  );
}
