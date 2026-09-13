import { useFormContext, type FieldPathByValue, type FieldValues } from 'react-hook-form';
import type { Point2d } from '@sharedTypes/engine';
import { MultipleField } from '@base/components/form-field/multiple-field';
import { InlineSubField } from '@base/components/form-field/inline-sub-field';
import { Input } from '@base/components/ui/input';

type PositionFieldProps<T extends FieldValues> = {
  name: FieldPathByValue<T, Point2d>;
  label: string;
  hint?: string;
  disabled?: boolean;
};

export function PositionField({ name, label, hint, disabled }: PositionFieldProps<any>) {
  const { register, formState } = useFormContext();

  return (
    <MultipleField label={label} hint={hint} error={formState.errors.root?.message?.toString()}>
      <InlineSubField label="x">
        <Input
          type="number"
          {...register(`${name}.x`, {
            valueAsNumber: true,
          })}
          disabled={disabled}
        />
      </InlineSubField>
      <InlineSubField label="y">
        <Input
          type="number"
          {...register(`${name}.y`, {
            valueAsNumber: true,
          })}
          disabled={disabled}
        />
      </InlineSubField>
    </MultipleField>
  );
}
