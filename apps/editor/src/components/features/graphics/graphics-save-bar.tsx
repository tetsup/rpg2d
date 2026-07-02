import { useTranslation } from 'react-i18next';
import { Save } from 'lucide-react';
import { ActionCard } from '@editor/components/parts/action-card';
import { StyledSwitch } from '@editor/components/parts/styled-switch';

type GraphicsSaveBarProps = {
  isDraft: boolean;
  onDraftChange: (isDraft: boolean) => void;
  isDirty: boolean;
  isValid: boolean;
  isSaving: boolean;
  onSave: () => void;
};

export function GraphicsSaveBar({
  isDraft,
  onDraftChange,
  isDirty,
  isValid,
  isSaving,
  onSave,
}: GraphicsSaveBarProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3 border-t border-border bg-background p-3">
      <label className="block space-y-1 text-sm">
        <span className="text-muted-foreground">{t('保存形式')}</span>
        <StyledSwitch
          variant="segmented"
          labelOn={t('下書き')}
          labelOff={t('正式')}
          checked={isDraft}
          onCheckedChange={onDraftChange}
        />
      </label>
      <ActionCard
        type="button"
        icon={Save}
        title={isSaving ? `${t('保存中')}...` : t('保存')}
        description={t('変更内容を保存する')}
        variant={isDirty ? (isValid ? 'success' : 'error') : 'disabled'}
        disabled={!isValid || !isDirty || isSaving}
        onClick={onSave}
      />
    </div>
  );
}
