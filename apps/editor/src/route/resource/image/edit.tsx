import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { ImageEditor } from '@editor/components/features/grid-editor/image-editor';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { useDocumentById } from '@editor/hooks/api/by-id';

export function EditImagePage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const data = useDocumentById('resources', id);

  return (
    <LayoutShell titleBarProps={{ title: t('イメージ編集') }}>
      <ImageEditor
        defaultValues={{ namespace: 'test', type: 'image', name: 'test', version: 0, isDraft: false, data }}
      />
    </LayoutShell>
  );
}
