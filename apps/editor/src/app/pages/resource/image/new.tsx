import { useTranslation } from 'react-i18next';
import { ImageData } from '@sharedTypes/resource/image';
import { PageShell } from '@editor/widget/shell/page-shell';
import { ImageEditor } from '@editor/feature/image/image-editor';

export function NewImagePage() {
  const { t } = useTranslation();
  const data: ImageData = {
    size: { width: 16, height: 16 },
    palette: {
      '00': [255, 255, 255, 255],
      ff: [0, 0, 0, 0],
    },
    pixels: [
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
    ],
  };

  return (
    <PageShell flush titleBarProps={{ title: t('イメージ編集') }}>
      <ImageEditor
        defaultValues={{ namespace: 'test', type: 'image', name: 'test', version: 0, isDraft: false, data }}
      />
    </PageShell>
  );
}
