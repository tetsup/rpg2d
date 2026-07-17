import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Save } from 'lucide-react';
import type { ResourceInput } from '@sharedTypes/database/collection';
import { ResourcePath } from '@sharedTypes/resource/common';
import { formatResourceId } from '@schema/resource/common/base';
import { createDocument, updateDocument } from '@editor/hooks/api/mutations';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@editor/components/ui/dialog';
import { SubmitCard } from '@editor/components/parts/submit-card';
import { InputField } from '../form/input-field';
import { ToolbarIconButton } from './toolbar-icon-button';

type SavePopupButtonProps = {
  defaultPath?: ResourcePath;
};

export function SavePopupButton({ defaultPath }: SavePopupButtonProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const form = useFormContext<ResourceInput<'image'>>();
  const [open, setOpen] = useState(false);
  const onSubmit = (data: ResourceInput<'image'>) => {
    try {
      if (defaultPath) updateDocument('resources', formatResourceId(defaultPath), data);
      else createDocument('resources', data);
    } catch (e) {
      if (e.code === 'DUPLICATE_NAME') {
        form.setError('name', {
          type: 'server',
          message: 'この名前は既に存在します',
        });
        return;
      }
    }
    navigate(`/resources/image/${formatResourceId(data)}`);
  };

  return (
    <>
      <ToolbarIconButton
        icon={<Save />}
        label={t('保存')}
        showDirtyDot={form.formState.isDirty}
        onClick={() => {
          setOpen(true);
        }}
      />
      <Dialog
        open={open}
        onOpenChange={() => {
          setOpen(false);
        }}
      >
        <DialogContent className="p-4 gap-4 overflow-hidden">
          <DialogHeader className="p-0">
            <DialogTitle>{t('イメージを保存')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <InputField name="namespace" label={t('グループ')} />
            <InputField name="name" label={t('イメージ名')} />
            <SubmitCard />
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
