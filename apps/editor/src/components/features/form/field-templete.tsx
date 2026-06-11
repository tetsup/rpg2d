import { useFormContext } from 'react-hook-form';
import { ResourceType } from '@sharedTypes/resource/common';
import { ControlField } from '@editor/components/forms/control-field';
import { Input } from '@editor/components/ui/input';
import { Select } from '@editor/components/ui/select';
import { ControlSection } from '@editor/components/forms/control-section';
import { ResourcePicker } from '@editor/components/parts/resource-picker';

type InputProps = {
  name: string;
  type: 'text';
};

type SelectItem = {
  label: string;
  value: string;
};

type SelectProps = {
  name: string;
  type: 'select';
  items: SelectItem[];
};

type ResourcePickerProps = {
  name: string;
  type: 'select-resource';
  resourceType: ResourceType;
};

type NamespacePickerProps = {
  name: string;
  type: 'select-namespace';
  permission: 'read' | 'create';
};

type ControlProps = InputProps | SelectProps | ResourcePickerProps | NamespacePickerProps;

type FieldTempleteProps = ControlProps & {
  label: string;
};

export type FieldGroupTemplateProps = {
  title: string;
  items: FieldTempleteProps[];
};

function Control(props: ControlProps) {
  const { control, setValue } = useFormContext();

  switch (props.type) {
    case 'text':
      return <Input {...control} className="w-full" type="text" name={props.name} />;
    case 'select':
      return <Select {...control} name={props.name} items={props.items} />;
    case 'select-resource':
      return (
        <ResourcePicker
          type={props.resourceType}
          onSelect={(value) => {
            setValue(props.name, value);
          }}
        />
      );
    case 'select-namespace':
      return null;
  }
}

function FieldTemplate({ label, ...props }: FieldTempleteProps) {
  return (
    <ControlField label={label}>
      <Control {...props} />
    </ControlField>
  );
}

export function FieldGroupTemplate({ title, items }: FieldGroupTemplateProps) {
  return (
    <ControlSection title={title}>
      {items.map((item) => (
        <FieldTemplate {...item} />
      ))}
    </ControlSection>
  );
}
