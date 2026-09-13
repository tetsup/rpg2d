import { type FieldArrayPathByValue, useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import type { AnimationFrame } from '@sharedTypes/resource/texture';
import { VerticalStacker } from '@base/components/layout/vertical-stacker';
import { StyledButton } from '@base/components/form-control/styled-button';
import { FormSection } from '@base/components/form-field/form-section';
import { buildFrameData } from '@editor/factory/texture';
import { FrameItem } from './frame-item';

type FrameListProps = { name: FieldArrayPathByValue<any, AnimationFrame> };

export function FrameList({ name }: FrameListProps) {
  const { t } = useTranslation();
  const { control } = useFormContext();
  const { fields: frames, append, remove } = useFieldArray({ control, name });

  return (
    <VerticalStacker>
      {frames.map((_, index) => (
        <FormSection title={`${t('フレーム')}${index + 1}`}>
          <FrameItem key={index} name={`${name}.${index}`} onRemove={() => remove(index)} />
        </FormSection>
      ))}
      <StyledButton variant="outline" onClick={() => append(buildFrameData(), { shouldFocus: false })}>
        <Plus />
        {t('フレームを追加')}
      </StyledButton>
    </VerticalStacker>
  );
}
