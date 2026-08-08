import { StyledSwitch } from '@base/components/form-control/styled-switch';
import { FieldWrapper } from '@editor/old/shared/form/components/field-wrapper';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export function DraftModeToggleField() {
  const { t } = useTranslation();
  const { control, trigger } = useFormContext();

  return (
    <FieldWrapper name="isDraft" label={t('保存形式')}>
      <Controller
        name="isDraft"
        control={control}
        render={({ field }) => (
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
        )}
      />
    </FieldWrapper>
  );
}
