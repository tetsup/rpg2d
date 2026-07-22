import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LayoutShell } from '@editor/app/layout/components/layout-shell';
import { ControlSection } from '@editor/shared/form/components/control-section';
import { resourceTypeGroups, resourceTypeMeta } from '@editor/shared/lib/resource-type-meta';
import { MenuCard } from '@editor/shared/parts/menu-card';

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
