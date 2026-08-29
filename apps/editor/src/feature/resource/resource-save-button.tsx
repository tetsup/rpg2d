import { useFormContext } from 'react-hook-form';
import { Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ResourceType } from '@sharedTypes/resource/common';
import type { ResourceInput } from '@sharedTypes/database/collection';
import { ToolbarButton } from '@base/components/toolbar/toolbar-button';
import { IndicatorDot } from '@base/components/attachment/indicator-dot';
import { useDialogContext } from '@base/components/dialog/dialog-context';
import { useAlert } from '../../shared/providers/alert';
import { useErrorHandler } from '../../widget/notification/error-handler';

export function ResourceSaveButton<T extends ResourceType>() {
  const { setOpen } = useDialogContext();
  const form = useFormContext<ResourceInput<T>>();
  const alert = useAlert();
  useErrorHandler(form, alert);
  const { t } = useTranslation();

  return (
    <ToolbarButton
      label={t('保存')}
      onClick={() => {
        setOpen(true);
      }}
      indicator={form.formState.isDirty && <IndicatorDot color="warning" />}
      active={form.formState.isValid}
    >
      <Save />
    </ToolbarButton>
  );
}
