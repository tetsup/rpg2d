import { useState } from 'react';
import { Controller, useFormContext, type FieldPathByValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { FilterMap } from '@sharedTypes/database/filter';
import type { DatabaseInput } from '@sharedTypes/database/collection';
import { SingleField } from '@base/components/form-field/single-field';
import { SelectButton } from '@base/components/form-control/select-button';
import type { createRepository } from '@editor/shared/repository/factory';
import { SelectDialog } from '../dialog/select-dialog';

type SelectFieldProps<T extends keyof FilterMap> = {
  name: FieldPathByValue<DatabaseInput[T], string>;
  label: string;
  hint?: string;
  renderItem: (id: string) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  mergeQuery: (searchText: string) => FilterMap[T][];
  useInfiniteSearch: ReturnType<typeof createRepository<T>>['useInfiniteSearch'];
};

export function SelectField<T extends keyof FilterMap>({
  name,
  label,
  hint,
  renderItem,
  renderEmpty,
  mergeQuery,
  useInfiniteSearch,
}: SelectFieldProps<T>) {
  const { t } = useTranslation();
  const { control } = useFormContext();
  const [open, setOpen] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <SingleField label={label} hint={hint} error={fieldState.error?.message}>
          <SelectButton onClick={() => setOpen(true)}>
            {field.value ? renderItem(field.value) : renderEmpty?.()}
          </SelectButton>
          <SelectDialog
            open={open}
            onClose={() => {
              setOpen(false);
            }}
            title={t('選択してください')}
            mergeQuery={mergeQuery}
            useInfiniteSearch={useInfiniteSearch}
            onCommit={field.onChange}
            renderItem={renderItem}
          />
        </SingleField>
      )}
    />
  );
}
