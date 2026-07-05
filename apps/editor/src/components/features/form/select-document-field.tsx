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
  showThumbnail?: boolean;
};

function SelectDocumentFieldControl<T extends FieldValues>({
  collectionName,
  name,
  resourceType,
  showThumbnail,
}: Pick<SelectDocumentFieldProps<T>, 'collectionName' | 'name' | 'resourceType' | 'showThumbnail'>) {
  const controlId = useFieldControlId();
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <DocumentPicker
          collectionName={collectionName}
          id={controlId}
          value={field.value}
          onSelect={field.onChange}
          resourceType={resourceType}
          showThumbnail={showThumbnail}
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
  showThumbnail,
}: SelectDocumentFieldProps<T>) {
  return (
    <FieldWrapper name={name} label={label} hint={hint}>
      <SelectDocumentFieldControl
        collectionName={collectionName}
        name={name}
        resourceType={resourceType}
        showThumbnail={showThumbnail}
      />
    </FieldWrapper>
  );
}
