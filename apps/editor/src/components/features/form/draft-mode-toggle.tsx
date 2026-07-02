import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FieldWrapper, useFieldControlId } from '@editor/components/forms/field-wrapper';
import { StyledSwitch } from '@editor/components/parts/styled-switch';

export function DraftModeToggle() {
  const { t } = useTranslation();
  const { control, trigger } = useFormContext();

  return (
    <FieldWrapper name="isDraft" label={t('保存形式')}>
      <DraftModeToggleControl control={control} trigger={trigger} />
    </FieldWrapper>
  );
}

function DraftModeToggleControl({
  control,
  trigger,
}: {
  control: ReturnType<typeof useFormContext>['control'];
  trigger: ReturnType<typeof useFormContext>['trigger'];
}) {
  const { t } = useTranslation();
  const controlId = useFieldControlId();

  return (
    <Controller
      name="isDraft"
      control={control}
      render={({ field }) => (
        <StyledSwitch
          id={controlId}
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
  );
}
