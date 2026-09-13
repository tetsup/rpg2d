import { useTranslation } from 'react-i18next';
import { NewResourcePage } from '@editor/feature/resource/page/new-page';
import { ManifestForm } from '@editor/feature/resource/form/manifest-form';

export function NewManifestPage() {
  const { t } = useTranslation();

  return (
    <NewResourcePage
      type="manifest"
      title={t('プロジェクト作成')}
      renderForm={({ defaultValues, onSubmit }) => <ManifestForm defaultValues={defaultValues} onSubmit={onSubmit} />}
    />
  );
}
