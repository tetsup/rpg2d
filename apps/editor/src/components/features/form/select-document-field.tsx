import { Controller, FieldPath, FieldValues, useFormContext } from 'react-hook-form';
import { FieldWrapper } from '@editor/components/forms/field-wrapper';
import { DocumentPicker } from '@editor/components/parts/document-picker';
import type { FilterMap } from '@sharedTypes/database/filter';
import type { ResourceType } from '@sharedTypes/resource/common';

export type SelectDocumentFieldProps<T extends FieldValues> = {
  collectionName: keyof FilterMap;
  name: FieldPath<T>;
  label: string;
  hint?: string;
  resourceType?: ResourceType;
};

export function SelectDocumentField<T extends FieldValues>({
  collectionName,
  name,
  label,
  hint,
  resourceType,
}: SelectDocumentFieldProps<T>) {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FieldWrapper name={name} label={label} hint={hint}>
          <DocumentPicker
            collectionName={collectionName}
            id={field.value}
            onSelect={field.onChange}
            resourceType={resourceType}
          />
        </FieldWrapper>
      )}
    />
  );
}
