import { Controller, FieldPath, FieldValues, useFormContext } from 'react-hook-form';
import { ResourceType } from '@sharedTypes/resource/common';
import { ControlField } from '@editor/components/forms/control-field';
import { ControlSection } from '@editor/components/forms/control-section';
import { ResourcePicker } from '@editor/components/parts/resource-picker';
import { Input } from '@editor/components/ui/input';
import { Select } from '@editor/components/ui/select';
import { SwitchField } from '@editor/components/parts/switch-field';

type InputProps = {
  name: string;
  type: 'text' | 'disabled-text';
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
  labelOn?: string;
  labelOff?: string;
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

type FieldTemplateProps<TValues extends FieldValues> = {
  name: FieldPath<TValues>;
  label: string;
  hint?: string;
} & ControlProps;

export type FieldGroupTemplateProps<TValues extends FieldValues> = {
  title: string;
  items: FieldTemplateProps<TValues>[];
};

function Control(props: ControlProps) {
  const { register, control } = useFormContext();

  switch (props.type) {
    case 'text':
    case 'disabled-text':
      return (
        <Input {...register(props.name)} className="w-full" type="text" disabled={props.type === 'disabled-text'} />
      );
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
          render={({ field }) => (
            <SwitchField
              checked={field.value}
              onCheckedChange={field.onChange}
              labelOn={props.labelOn}
              labelOff={props.labelOff}
            />
          )}
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

function FieldTemplate({ label, hint, name, ...props }: FieldTemplateProps<any>) {
  return (
    <ControlField name={name} label={label} hint={hint}>
      <Control name={name} {...props} />
    </ControlField>
  );
}

export function FieldGroupTemplate({ title, items }: FieldGroupTemplateProps<any>) {
  return (
    <ControlSection title={title}>
      {items.map((item) => (
        <FieldTemplate key={item.name} {...item} />
      ))}
    </ControlSection>
  );
}
