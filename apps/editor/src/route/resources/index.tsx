import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ControlSection } from '@editor/components/forms/control-section';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { MenuCard } from '@editor/components/parts/menu-card';
import { resourceTypeGroups, resourceTypeMeta } from '@editor/lib/resource-type-meta';

export function ResourceTypeSelectPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <LayoutShell titleBarProps={{ title: t('検索') }}>
      {resourceTypeGroups.map((group) => (
        <ControlSection key={group.id} title={t(group.title)} description={t(group.description)}>
          {group.types.map((type) => {
            const meta = resourceTypeMeta[type];
            return (
              <MenuCard
                key={type}
                icon={meta.icon}
                title={t(meta.label)}
                description={t(meta.description)}
                onClick={() => navigate(`/resources/${type}`)}
              />
            );
          })}
        </ControlSection>
      ))}
    </LayoutShell>
  );
}
