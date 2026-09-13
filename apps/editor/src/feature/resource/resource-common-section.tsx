import { useTranslation } from 'react-i18next';
import { FormSection } from '@base/components/form-field/form-section';
import { namespaceRepository } from '@editor/shared/repository/namespace-repository';
import { SelectField } from '@editor/widget/field/select-field';
import { HiddenField } from '@editor/widget/field/hidden-field';
import { TextField } from '@editor/widget/field/text-field';
import { NamespaceItem } from '../namespace/namespace-item';

export function ResourceCommonSection() {
  const { t } = useTranslation();

  return (
    <FormSection title={t('概要')}>
      <SelectField
        name="namespace"
        label={t('グループ')}
        renderItem={(id) => <NamespaceItem id={id} />}
        mergeQuery={(q) => [{ name: 'q', value: q }]}
        useInfiniteSearch={namespaceRepository.useInfiniteSearch}
      />
      <HiddenField name="type" />
      <TextField name="name" label={t('ID')} />
      <TextField name="description" label={t('説明')} />
    </FormSection>
  );
}
