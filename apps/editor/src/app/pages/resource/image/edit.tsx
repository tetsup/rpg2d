import { useTranslation } from 'react-i18next';
import { EditResourcePage } from '@editor/feature/resource/page/edit-page';
import { ImageForm } from '@editor/feature/resource/form/image-form';

export function EditImagePage() {
  const { t } = useTranslation();
  return (
    <EditResourcePage
      type="image"
      title={t('イメージ編集')}
      renderForm={({ defaultValues, onSubmit }) => <ImageForm defaultValues={defaultValues} onSubmit={onSubmit} />}
      flush
    />
  );
}
