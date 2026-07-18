import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Save } from 'lucide-react';
import type { ResourceInput } from '@sharedTypes/database/collection';
import { ResourcePath } from '@sharedTypes/resource/common';
import { formatResourceId } from '@schema/resource/common/base';
import { useAlert } from '@editor/providers/alert';
import { createDocument, updateDocument } from '@editor/hooks/api/mutations';
import { useErrorHandler } from '@editor/hooks/ui/error-handler';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@editor/components/ui/dialog';
import { SubmitCard } from '@editor/components/parts/submit-card';
import { InputField } from '../form/input-field';
import { ToolbarIconButton } from './toolbar-icon-button';

type SavePopupButtonProps = {
  defaultPath?: ResourcePath;
};

export function SavePopupButton({ defaultPath }: SavePopupButtonProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const form = useFormContext<ResourceInput<'image'>>();
  const alert = useAlert();
  const errorHandler = useErrorHandler(form, alert);
  const onSubmit = (data: ResourceInput<'image'>) => {
    errorHandler(async () => {
      if (defaultPath) await updateDocument('resources', formatResourceId(defaultPath), data);
      else await createDocument('resources', data);
      navigate(`/resources/${formatResourceId(data)}`);
    });
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
        <DialogContent
          className="
            p-4
            gap-4
            overflow-hidden
            top-[12vh]
            translate-y-0
            sm:top-1/2
            sm:-translate-y-1/2
          "
        >
          <DialogHeader className="p-0">
            <DialogTitle>{t('イメージを保存')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <InputField name="namespace" label={t('グループ')} />
            <InputField name="name" label={t('イメージ名')} />
            <InputField name="description" label={t('説明')} />
            <SubmitCard />
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
