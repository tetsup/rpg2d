import { useTranslation } from 'react-i18next';
import { ImageData } from '@sharedTypes/resource/image';
import { ImageEditor } from '@editor/components/features/grid-editor/image-editor';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';

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
    <LayoutShell flush titleBarProps={{ title: t('イメージ編集') }}>
      <ImageEditor
        defaultValues={{ namespace: 'test', type: 'image', name: 'test', version: 0, isDraft: false, data }}
      />
    </LayoutShell>
  );
}
