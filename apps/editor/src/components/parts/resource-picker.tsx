import { ResourceType } from '@sharedTypes/resource/common';
import { ResourceDocument } from '@sharedTypes/database/collection';
import { DocumentPicker } from './document-picker';
import { SelectResource } from './select-resource';

type ResourcePickerProps = {
  id?: string;
  onSelect: (document: ResourceDocument) => void;
  onCreate?: () => void;
  type: ResourceType;
};

export function ResourcePicker({ type, ...props }: ResourcePickerProps) {
  return (
    <DocumentPicker
      {...props}
      renderSelect={({ onSelect }) => <SelectResource type={type} onItemSelect={onSelect} />}
    />
  );
}
