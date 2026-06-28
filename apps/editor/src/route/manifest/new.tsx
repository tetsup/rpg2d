import { useTranslation } from 'react-i18next';
import { createInvalidResourceInputSchema } from '@schema/database/resource';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { FormTemplete } from '@editor/components/features/form/form-templete';
import { ManifestForm } from '@editor/forms/manifest';
import { ResourceInput } from '@sharedTypes/database/collection';
import { useNavigate } from 'react-router-dom';
import { fetchPostApi } from '@editor/lib/api/post';

const manifestCreateSchema = createInvalidResourceInputSchema('manifest');

export function NewManifestPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fields = ManifestForm({ mode: 'create' });

  const defaultValues: ResourceInput<'manifest'> = {
    namespace: '',
    type: 'manifest',
    name: '',
    version: 0,
    description: '',
    isValid: false,
    data: {
      initialState: {
        core: { players: [], variables: {}, mode: 'field' },
        field: { fieldId: '', pos: { x: 0, y: 0 }, direction: 'down', actionIds: [] },
      },
      schemas: { playerState: {} },
      config: {
        blockSize: { width: 16, height: 16 },
        textSize: { width: 7, height: 7 },
        moveDurationMs: 500,
        screen: { width: 320, height: 240 },
        defaultMessagePanel: '',
        messageConfig: { speedMs: 100, margin: { left: 0, top: 0, right: 1, bottom: 1 } },
      },
    },
  };

  const onSubmit = async (values: ResourceInput<'manifest'>) => {
    const { namespace, type, name } = values;
    await fetchPostApi(`/api/resources/${namespace}/${type}/${name}`, values);
    navigate(`/resource/${namespace}/${type}/${name}`);
  };
  return (
    <LayoutShell titleBarProps={{ title: t('プロジェクト設定') }}>
      <FormTemplete
        fieldGroups={fields}
        schema={manifestCreateSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
      />
    </LayoutShell>
  );
}
