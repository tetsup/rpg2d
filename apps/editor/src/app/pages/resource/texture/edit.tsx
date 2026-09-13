import { useTranslation } from 'react-i18next';
import { EditResourcePage } from '@editor/feature/resource/page/edit-page';
import { TextureForm } from '@editor/feature/resource/form/texture-form';

export function EditTexturePage() {
  const { t } = useTranslation();
  return (
    <EditResourcePage
      type="texture"
      title={t('テクスチャ編集')}
      renderForm={({ defaultValues, onSubmit }) => <TextureForm defaultValues={defaultValues} onSubmit={onSubmit} />}
    />
  );
}
