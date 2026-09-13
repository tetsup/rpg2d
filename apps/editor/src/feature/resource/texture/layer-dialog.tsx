import { FieldPathByValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Delete } from 'lucide-react';
import { DialogLayout } from '@base/components/dialog/dialog-layout';
import { FormSection } from '@base/components/form-field/form-section';
import { StyledButton } from '@base/components/form-control/styled-button';
import { ImageLayer } from '@sharedTypes/engine';
import { NumberField } from '@editor/widget/field/number-field';
import { PositionField } from '@editor/widget/field/position-field';
import { ResourceSelect } from '../resource-select';
import { GridStacker } from '@base/components/grid-list/grid-stacker';

type LayerDialogProps = {
  name: FieldPathByValue<any, ImageLayer>;
  open: boolean;
  onClose: () => void;
  onRemove: () => void;
};

export function LayerDialog({ name, open, onClose, onRemove }: LayerDialogProps) {
  const { t } = useTranslation();
  return (
    <DialogLayout
      open={open}
      onClose={onClose}
      title={t('レイヤーの編集')}
      content={
        <FormSection title={t('レイヤーの編集')}>
          <GridStacker size="lg">
            <ResourceSelect name={`${name}.image`} label="画像" resourceType="image" />
          </GridStacker>
          <NumberField name={`${name}.priority`} label={t('優先度')} />
          <PositionField name={`${name}.pos`} label={t('位置オフセット')} />
          <StyledButton variant="outline" onClick={onClose}>
            {t('閉じる')}
          </StyledButton>
          <StyledButton
            variant="destructive"
            onClick={() => {
              onRemove();
              onClose();
            }}
          >
            <Delete />
            {t('削除')}
          </StyledButton>
        </FormSection>
      }
    />
  );
}
