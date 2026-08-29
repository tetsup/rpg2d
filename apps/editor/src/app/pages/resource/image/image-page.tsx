import { useNavigate } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResourceInput } from '@sharedTypes/database/collection';
import { ImageData } from '@sharedTypes/resource/image';
import { formatResourceId } from '@schema/resource/common/base';
import { ResourceInputSchemaMap } from '@schema/database/resource';
import { DialogProvider } from '@base/components/dialog/dialog-context';
import { ImageEditor } from '@editor/feature/image/image-editor';
import { ResourceSaveForm } from '@editor/feature/resource/resource-save-form';
import { useErrorHandler } from '@editor/widget/notification/error-handler';
import { useAlert } from '@editor/shared/providers/alert';

type ImagePageProps = {
  defaultValues: ResourceInput<'image'>;
  onSubmit: (values: ResourceInput<'image'>) => Promise<void>;
};

export function ImagePage({ defaultValues, onSubmit }: ImagePageProps) {
  const { t } = useTranslation();
  const form = useForm<ResourceInput<'image'>>({
    defaultValues,
    resolver: zodResolver(ResourceInputSchemaMap.image),
    mode: 'all',
  });
  const navigate = useNavigate();
  const alert = useAlert();
  const errorHandler = useErrorHandler(form, alert);
  const handleSubmit = (data: ResourceInput<'image'>) => {
    errorHandler(async () => {
      await onSubmit(data);
      navigate(`/resources/${formatResourceId(data)}`);
    });
  };

  return (
    <DialogProvider title={t('イメージを保存')} content={<ResourceSaveForm form={form} onSubmit={handleSubmit} />}>
      <FormProvider {...form}>
        <ImageEditor
          data={form.watch('data') as ImageData}
          setData={(data) => {
            form.setValue('data', data);
          }}
        />
      </FormProvider>
    </DialogProvider>
  );
}
