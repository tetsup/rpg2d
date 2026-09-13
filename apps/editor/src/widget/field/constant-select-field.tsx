import { useState } from 'react';
import { Controller, useFormContext, type FieldPathByValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { FilterMap } from '@sharedTypes/database/filter';
import type { DatabaseInput } from '@sharedTypes/database/collection';
import { SingleField } from '@base/components/form-field/single-field';
import { SelectButton } from '@base/components/form-control/select-button';
import { ConstantSelectDialog } from '../dialog/constant-select-dialog';

type ConstantItem<T> = {
  value: T;
  label: string;
};

type ConstantSelectFieldProps<T extends keyof FilterMap, V> = {
  name: FieldPathByValue<DatabaseInput[T], V>;
  label: string;
  hint?: string;
  renderItem: (item: ConstantItem<V>) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  values: ConstantItem<V>[];
  itemSize?: 'full' | 'sm' | 'md' | 'lg';
};

export function ConstantSelectField<T extends keyof FilterMap>({
  name,
  label,
  hint,
  renderItem,
  renderEmpty,
  values,
  itemSize = 'full',
}: ConstantSelectFieldProps<T, any>) {
  const { t } = useTranslation();
  const { control } = useFormContext();
  const [open, setOpen] = useState(false);

  const renderSelected = (selected: T) => {
    const selectedLabel = values.find((item) => item.value === selected);
    return selectedLabel ? renderItem(selectedLabel) : renderEmpty?.();
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <SingleField label={label} hint={hint} error={fieldState.error?.message}>
          <SelectButton onClick={() => setOpen(true)}>{renderSelected(field.value)}</SelectButton>
          <ConstantSelectDialog
            open={open}
            onClose={() => setOpen(false)}
            title={t('選択してください')}
            onChange={(value) => {
              field.onChange(value);
              setOpen(false);
            }}
            renderItem={renderItem}
            values={values}
            itemSize={itemSize}
          />
        </SingleField>
      )}
    />
  );
}
