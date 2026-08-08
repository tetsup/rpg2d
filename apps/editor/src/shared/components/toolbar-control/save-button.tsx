import { Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ToolbarButton } from '@base/components/toolbar/toolbar-button';
import { IndicatorDot } from '@base/components/attachment/indicator-dot';

type ToolbarSaveButtonProps = {
  onClick: () => void;
  isDirty?: boolean;
  isValid?: boolean;
};

export function ToolbarSaveButton({ onClick, isDirty, isValid }: ToolbarSaveButtonProps) {
  const { t } = useTranslation();

  return (
    <ToolbarButton
      icon={Save}
      label={t('保存')}
      onClick={onClick}
      indicator={isDirty && <IndicatorDot color="warning" />}
      active={isValid ?? true}
    />
  );
}
