import { FieldPathByValue } from 'react-hook-form';
import type { ResourceInput } from '@sharedTypes/database/collection';
import type { ResourceType } from '@sharedTypes/resource/common';
import { resourceRepository } from '@editor/shared/repository/resource-repository';
import { ResourceItem } from './resource-item';
import { SelectField } from '@editor/widget/field/select-field';

type ResourceSelectProps<T extends ResourceType> = {
  name: FieldPathByValue<ResourceInput<T>, string>;
  label: string;
  resourceType: T;
};

export function ResourceSelect({ name, label, resourceType }: ResourceSelectProps<any>) {
  return (
    <SelectField
      name={name}
      label={label}
      renderItem={(id) => <ResourceItem id={id} />}
      mergeQuery={(text) => [
        { name: 'q', value: text },
        { name: 'type', op: 'eq', value: resourceType },
      ]}
      useInfiniteSearch={resourceRepository.useInfiniteSearch}
    />
  );
}
