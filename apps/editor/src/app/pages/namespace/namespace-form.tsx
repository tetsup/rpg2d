import { useTranslation } from 'react-i18next';
import type { DatabaseInput } from '@sharedTypes/database/collection';
import { FormSection } from '@base/components/form-field/form-section';
import { NamespaceInputSchema } from '@schema/database/namespace';
import { FormShell } from '@editor/widget/shell/form-shell';
import { TextField } from '@editor/widget/field/text-field';
import { SwitchField } from '@editor/widget/field/switch-field';

type NamespaceFormProps = {
  defaultValues: DatabaseInput['namespaces'];
  onSubmit: (v: DatabaseInput['namespaces']) => Promise<void>;
};

export function NamespaceForm({ defaultValues, onSubmit }: NamespaceFormProps) {
  const { t } = useTranslation();

  return (
    <FormShell schema={NamespaceInputSchema} defaultValues={defaultValues} onSubmit={onSubmit}>
      <FormSection title={t('グループ設定')}>
        <TextField name="id" label={t('ID')} />
        <TextField name="presenceName" label={t('グループ名')} />
        <TextField name="description" label={t('説明')} />
        <SwitchField
          name="isPrivate"
          label={t('公開設定')}
          variant="segmented"
          labelOn={t('公開')}
          labelOff={t('非公開')}
        />
      </FormSection>
    </FormShell>
  );
}
