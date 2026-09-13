import type { FieldPathByValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Delete } from 'lucide-react';
import type { AnimationFrame } from '@sharedTypes/resource/texture';
import { StyledButton } from '@base/components/form-control/styled-button';
import { NumberField } from '@editor/widget/field/number-field';
import { LayerList } from './layer-list';

type FrameItemProps = {
  name: FieldPathByValue<any, AnimationFrame>;
  onRemove: () => void;
};

export function FrameItem({ name, onRemove }: FrameItemProps) {
  const { t } = useTranslation();

  return (
    <>
      <LayerList name={`${name}.layers`} />
      <NumberField name={`${name}.duration`} label={t('継続時間')} />
      <StyledButton variant="destructive" onClick={() => onRemove()}>
        <Delete />
        {t('フレームを削除')}
      </StyledButton>
    </>
  );
}
