import { useTranslation } from 'react-i18next';
import { ResourceTypes } from '@editor/feature/resource/resource-types';
import { PageShell } from '@editor/widget/shell/page-shell';

export function ResourceTypeSelectPage() {
  const { t } = useTranslation();

  return (
    <PageShell titleBarProps={{ title: t('リソース編集') }}>
      <ResourceTypes />
    </PageShell>
  );
}
