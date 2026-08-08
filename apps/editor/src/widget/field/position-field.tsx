import type { FieldPathByValue, FieldValues } from 'react-hook-form';
import type { Point2d } from '@sharedTypes/engine';
import { MultipleField } from '@base/components/form-field/multiple-field';
import { InlineSubField } from '@base/components/form-field/inline-sub-field';
import { Input } from '@base/components/ui/input';

type PositionFieldProps<T extends FieldValues> = {
  name: FieldPathByValue<T, Point2d>;
  label: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
};

export function PositionField({ name, label, hint, error, disabled }: PositionFieldProps<any>) {
  return (
    <MultipleField label={label} hint={hint} error={error}>
      <InlineSubField label="x">
        <Input name={`${name}.x`} type="number" disabled={disabled} />
      </InlineSubField>
      <InlineSubField label="y">
        <Input name={`${name}.y`} type="number" disabled={disabled} />
      </InlineSubField>
    </MultipleField>
  );
}
