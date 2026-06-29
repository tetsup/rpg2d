import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { SelectDocument } from '@editor/components/parts/select-document';

export function ResourceListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <LayoutShell titleBarProps={{ title: t('検索') }}>
      <SelectDocument
        collectionName="resources"
        onItemSelect={(item) => navigate(`/resource/${item.id}`)}
      />
    </LayoutShell>
  );
}
