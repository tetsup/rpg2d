import { FieldPath, FieldValues } from 'react-hook-form';
import { NumberFieldControl } from './number-field';
import { FieldWrapper, useFieldControlId } from './field-wrapper';

export type FieldPosFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  hint?: string;
  disabled?: boolean;
};

function FieldPosFieldControl<T extends FieldValues>({
  name,
  disabled,
}: Pick<FieldPosFieldProps<T>, 'name' | 'disabled'>) {
  const controlId = useFieldControlId();
  const xId = `${controlId}-x`;
  const yId = `${controlId}-y`;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex items-center gap-2">
        <label htmlFor={xId} className="w-4 text-sm">
          x
        </label>
        <NumberFieldControl name={`${name}.x`} id={xId} disabled={disabled} />
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor={yId} className="w-4 text-sm">
          y
        </label>
        <NumberFieldControl name={`${name}.y`} id={yId} disabled={disabled} />
      </div>
    </div>
  );
}

export function FieldPosField<T extends FieldValues>({ name, label, hint, disabled }: FieldPosFieldProps<T>) {
  return (
    <FieldWrapper name={name} label={label} hint={hint} labelVariant="group">
      <FieldPosFieldControl name={name} disabled={disabled} />
    </FieldWrapper>
  );
}
