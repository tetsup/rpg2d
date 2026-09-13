import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ResourceInput } from '@sharedTypes/database/collection';
import { ResourceInputSchemaMap } from '@schema/database/resource';
import { FormSection } from '@base/components/form-field/form-section';
import { FormShell } from '@editor/widget/shell/form-shell';
import { ConstantSelectField } from '@editor/widget/field/constant-select-field';
import { FrameList } from '@editor/feature/resource/texture/frame-list';
import { ResourceCommonSection } from '@editor/feature/resource/resource-common-section';

type TextureFormProps = {
  onSubmit: (data: ResourceInput<'texture'>) => void;
  defaultValues: ResourceInput<'texture'>;
};

export function TextureForm({ onSubmit, defaultValues }: TextureFormProps) {
  const { t } = useTranslation();
  const form = useForm({
    resolver: zodResolver(ResourceInputSchemaMap.texture),
    defaultValues,
  });
  const postActions = [
    { value: 'off', label: t('非表示') },
    { value: 'pause', label: t('停止') },
    { value: 'repeat', label: t('繰り返し') },
  ];

  return (
    <FormShell form={form} onSubmit={onSubmit}>
      <ResourceCommonSection />
      <FormSection title={t('コンフィグ')}>
        <FrameList name="data.frames" />
        <ConstantSelectField
          name="data.postAction"
          label={t('再生後の動作')}
          renderItem={({ label }) => label}
          values={postActions}
        />
      </FormSection>
    </FormShell>
  );
}
