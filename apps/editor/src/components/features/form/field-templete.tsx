import { FieldPath, FieldValues, useFormContext } from 'react-hook-form';
import { ControlSection } from '@editor/components/forms/control-section';
import { Input } from '@editor/components/ui/input';
import { InputField, type InputFieldProps } from './input-field';
import { SelectField, type SelectFieldProps } from './select-field';
import { FieldPosField, type FieldPosFieldProps } from './field-pos-field';
import { SwitchField, type SwitchFieldProps } from './switch-field';
import { SelectDocumentField, type SelectDocumentFieldProps } from './select-document-field';

type FieldTemplateParamMap<T extends FieldValues> = {
  text: InputFieldProps<T>;
  hidden: { name: FieldPath<T> };
  select: SelectFieldProps<T>;
  switch: SwitchFieldProps<T>;
  'select-document': SelectDocumentFieldProps<T>;
  'field-position': FieldPosFieldProps<T>;
};

type FieldTemplateProps<TValues extends FieldValues, TType extends keyof FieldTemplateParamMap<TValues>> = {
  type: TType;
  params: FieldTemplateParamMap<TValues>[TType];
};

export type FieldItem<T extends FieldValues> = {
  [K in keyof FieldTemplateParamMap<T>]: FieldTemplateProps<T, K>;
}[keyof FieldTemplateParamMap<T>];

export type FieldGroupTemplateProps<T extends FieldValues> = {
  title: string;
  items: FieldItem<T>[];
};

function FieldTemplate<T extends FieldValues>({ type, params }: FieldItem<T>) {
  const { register } = useFormContext();

  switch (type) {
    case 'text':
      return <InputField {...params} />;
    case 'hidden':
      return <Input {...register(params.name)} />;
    case 'select':
      return <SelectField {...params} />;
    case 'switch':
      return <SwitchField {...params} />;
    case 'select-document':
      return <SelectDocumentField {...params} />;
    case 'field-position':
      return <FieldPosField {...params} />;
  }
}

export function FieldGroupTemplate<T extends FieldValues>({ title, items }: FieldGroupTemplateProps<T>) {
  return (
    <ControlSection title={title}>
      {items.map((item, index) => (
        <FieldTemplate key={index} {...item} />
      ))}
    </ControlSection>
  );
}
