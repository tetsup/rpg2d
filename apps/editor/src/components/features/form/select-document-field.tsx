import { Controller, FieldPath, FieldValues, useFormContext } from 'react-hook-form';
import { FieldWrapper, useFieldControlId } from '@editor/components/forms/field-wrapper';
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

function SelectDocumentFieldControl<T extends FieldValues>({
  collectionName,
  name,
  resourceType,
}: Pick<SelectDocumentFieldProps<T>, 'collectionName' | 'name' | 'resourceType'>) {
  const controlId = useFieldControlId();
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <DocumentPicker
          collectionName={collectionName}
          controlId={controlId}
          id={field.value}
          onSelect={field.onChange}
          resourceType={resourceType}
        />
      )}
    />
  );
}

export function SelectDocumentField<T extends FieldValues>({
  collectionName,
  name,
  label,
  hint,
  resourceType,
}: SelectDocumentFieldProps<T>) {
  return (
    <FieldWrapper name={name} label={label} hint={hint}>
      <SelectDocumentFieldControl collectionName={collectionName} name={name} resourceType={resourceType} />
    </FieldWrapper>
  );
}
