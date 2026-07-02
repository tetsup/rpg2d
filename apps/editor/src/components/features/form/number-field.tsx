import { Controller, FieldPath, FieldValues, useFormContext } from 'react-hook-form';
import { FieldWrapper, useFieldControlId } from '@editor/components/forms/field-wrapper';
import { Input } from '@editor/components/ui/input';

export type NumberFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  hint?: string;
  disabled?: boolean;
  integer?: boolean;
};

function formatNumberFieldValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}

function parseNumberFieldValue(raw: string, integer: boolean): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return null;
  }

  const parsed = integer ? Number.parseInt(trimmed, 10) : Number(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
}

export function NumberFieldControl<T extends FieldValues>({
  name,
  disabled,
  integer = true,
  id,
}: Pick<NumberFieldProps<T>, 'name' | 'disabled' | 'integer'> & { id?: string }) {
  const controlId = useFieldControlId();
  const inputId = id ?? controlId;
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Input
          id={inputId}
          type="number"
          inputMode={integer ? 'numeric' : 'decimal'}
          className="w-full"
          disabled={disabled}
          value={formatNumberFieldValue(field.value)}
          onChange={(event) => {
            field.onChange(parseNumberFieldValue(event.target.value, integer));
          }}
          onBlur={field.onBlur}
          name={field.name}
          ref={field.ref}
        />
      )}
    />
  );
}

export function NumberField<T extends FieldValues>({
  name,
  label,
  hint,
  disabled,
  integer,
}: NumberFieldProps<T>) {
  return (
    <FieldWrapper name={name} label={label} hint={hint}>
      <NumberFieldControl name={name} disabled={disabled} integer={integer} />
    </FieldWrapper>
  );
}
