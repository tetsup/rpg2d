import type { FieldPathByValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { FilterMap } from '@sharedTypes/database/filter';
import type { DatabaseInput } from '@sharedTypes/database/collection';
import { ResourcePreviewCard } from '@editor/shared/components/form-control/resource-preview-card';
import type { createRepository } from '@editor/shared/repository/factory';
import { SelectField } from './select-field';

type PreviewSelectFieldProps<T extends keyof FilterMap> = {
  name: FieldPathByValue<DatabaseInput[T], string>;
  label: string;
  hint?: string;
  mergeQuery: (searchText: string) => FilterMap[T][];
  useInfiniteSearch: ReturnType<typeof createRepository<T>>['useInfiniteSearch'];
};

export function PreviewSelectField<T extends keyof FilterMap>({
  name,
  label,
  hint,
  mergeQuery,
  useInfiniteSearch,
}: PreviewSelectFieldProps<T>) {
  const { t } = useTranslation();

  return (
    <SelectField
      name={name}
      label={label}
      hint={hint}
      mergeQuery={mergeQuery}
      useInfiniteSearch={useInfiniteSearch}
      renderItem={(id) => <ResourcePreviewCard id={id} />}
      renderEmpty={() => <span>{t('未選択')}</span>}
    />
  );
}
