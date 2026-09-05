import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ResourceInput } from '@sharedTypes/database/collection';
import { FormSection } from '@base/components/form-field/form-section';
import { ResourceInputSchemaMap } from '@schema/database/resource';
import { resourceRepository } from '@editor/shared/repository/resource-repository';
import { namespaceRepository } from '@editor/shared/repository/namespace-repository';
import { TextField } from '@editor/widget/field/text-field';
import { SelectField } from '@editor/widget/field/select-field';
import { HiddenField } from '@editor/widget/field/hidden-field';
import { PositionField } from '@editor/widget/field/position-field';
import { FormShell } from '@editor/widget/shell/form-shell';
import { ResourceItem } from '@editor/feature/resource/resource-item';

type TileFormProps = {
  defaultValues: ResourceInput<'tile'>;
  onSubmit: (v: ResourceInput<'tile'>) => Promise<void>;
};

export function TileForm({ defaultValues, onSubmit }: TileFormProps) {
  const { t } = useTranslation();
  const form = useForm({ mode: 'onChange', defaultValues, resolver: zodResolver(ResourceInputSchemaMap.manifest) });

  return (
    <FormShell form={form} onSubmit={onSubmit}>
      <FormSection title={t('タイル')}>
        <SelectField
          name="namespace"
          label={t('グループ')}
          renderItem={(id) => <ResourceItem id={id} />}
          mergeQuery={(q) => [{ name: 'q', value: q }]}
          useInfiniteSearch={namespaceRepository.useInfiniteSearch}
        />
        <HiddenField name="type" />
        <TextField name="name" label={t('タイル名')} />
        <TextField name="description" label={t('説明')} />
      </FormSection>
      <FormSection title={t('初期状態')}>
        <SelectField
          name="fieldId"
          label={t('フィールド')}
          renderItem={(id) => <ResourceItem id={id} />}
          mergeQuery={(q) => [
            { name: 'q', value: q },
            { name: 'type', op: 'eq', value: 'field' },
          ]}
          useInfiniteSearch={resourceRepository.useInfiniteSearch}
        />
        <PositionField name="fieldPos" label={t('開始位置')} />
      </FormSection>
      <FormSection title={t('コンフィグ')}>
        <SelectField
          name="panelId"
          label={t('パネル')}
          renderItem={(id) => <ResourceItem id={id} />}
          mergeQuery={(q) => [
            { name: 'q', value: q },
            { name: 'type', op: 'eq', value: 'panel' },
          ]}
          useInfiniteSearch={resourceRepository.useInfiniteSearch}
        />
      </FormSection>
    </FormShell>
  );
}
