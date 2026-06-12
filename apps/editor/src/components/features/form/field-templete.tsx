import { Controller, useFormContext } from 'react-hook-form';
import { ResourceType } from '@sharedTypes/resource/common';
import { ControlField } from '@editor/components/forms/control-field';
import { Input } from '@editor/components/ui/input';
import { Select } from '@editor/components/ui/select';
import { ControlSection } from '@editor/components/forms/control-section';
import { ResourcePicker } from '@editor/components/parts/resource-picker';
import { Switch } from '@editor/components/ui/switch';
import { fi } from 'zod/v4/locales';

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

type SwitchProps = {
  name: string;
  type: 'switch';
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

type ControlProps = InputProps | SelectProps | SwitchProps | ResourcePickerProps | NamespacePickerProps;

type FieldTempleteProps = ControlProps & {
  label: string;
};

export type FieldGroupTemplateProps = {
  title: string;
  items: FieldTempleteProps[];
};

function Control(props: ControlProps) {
  const { register, control, setValue } = useFormContext();

  switch (props.type) {
    case 'text':
      return <Input {...register(props.name)} className="w-full" type="text" />;
    case 'select':
      return (
        <Controller
          name={props.name}
          control={control}
          render={({ field }) => <Select value={field.value} onValueChange={field.onChange} items={props.items} />}
        />
      );
    case 'switch':
      return (
        <Controller
          name={props.name}
          control={control}
          render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
        />
      );
    case 'select-resource':
      return (
        <Controller
          name={props.name}
          control={control}
          render={({ field }) => (
            <ResourcePicker type={props.resourceType} value={field.value} onSelect={field.onChange} />
          )}
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
        <FieldTemplate key={item.name} {...item} />
      ))}
    </ControlSection>
  );
}
