import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Save } from 'lucide-react';
import type { ResourceInput } from '@sharedTypes/database/collection';
import type { ResourcePath } from '@sharedTypes/resource/common';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@base/components/ui/dialog';
import { formatResourceId } from '@schema/resource/common/base';
import { useAlert } from '@editor/shared/providers/alert';
import { useErrorHandler } from '@editor/shared/ui/error-handler';
import { createDocument, updateDocument } from '@editor/shared/api/hooks/mutations';
import { InputField } from '@editor/shared/form/components/input-field';
import { SubmitCard } from '@editor/shared/parts/submit-card';
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
