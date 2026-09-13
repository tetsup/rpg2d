import { useTranslation } from 'react-i18next';
import { NewResourcePage } from '@editor/feature/resource/page/new-page';
import { ImageForm } from '@editor/feature/resource/form/image-form';

export function NewImagePage() {
  const { t } = useTranslation();

  return (
    <NewResourcePage
      type="image"
      title={t('イメージ作成')}
      renderForm={({ defaultValues, onSubmit }) => <ImageForm defaultValues={defaultValues} onSubmit={onSubmit} />}
      flush
    />
  );
}
