import { StyledSwitch } from '@base/components/form-control/styled-switch';
import { SingleField } from '@base/components/form-field/single-field';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export function DraftModeToggleField() {
  const { t } = useTranslation();
  const { control, trigger } = useFormContext();

  return (
    <Controller
      name="isDraft"
      control={control}
      render={({ field }) => (
        <SingleField label={t('保存形式')}>
          <StyledSwitch
            variant="segmented"
            labelOn={t('下書き')}
            labelOff={t('正式')}
            checked={field.value}
            onCheckedChange={(checked) => {
              field.onChange(checked);
              void trigger();
            }}
          />
        </SingleField>
      )}
    />
  );
}
