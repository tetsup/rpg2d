import { useTranslation } from 'react-i18next';
import { NewResourcePage } from '@editor/feature/resource/page/new-page';
import { TextureForm } from '@editor/feature/resource/form/texture-form';

export function NewTexturePage() {
  const { t } = useTranslation();

  return (
    <NewResourcePage
      type="texture"
      title={t('テクスチャ作成')}
      renderForm={({ defaultValues, onSubmit }) => <TextureForm defaultValues={defaultValues} onSubmit={onSubmit} />}
    />
  );
}
