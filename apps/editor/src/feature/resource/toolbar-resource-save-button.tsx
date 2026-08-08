import { useState, type ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';
import type { ResourceType } from '@sharedTypes/resource/common';
import type { ResourceInput } from '@sharedTypes/database/collection';
import { DialogLayout } from '@base/components/dialog/dialog-layout';
import { ToolbarSaveButton } from '@editor/shared/components/toolbar-control/save-button';
import { useAlert } from '../../shared/providers/alert';
import { useErrorHandler } from '../../widget/notification/error-handler';
import { ResourceSaveForm } from './resource-save-form';

type SavePopupButtonProps = {
  title: string;
  additionalField?: ReactNode;
};

export function ToolbarResourceSaveButton<T extends ResourceType>({ title, additionalField }: SavePopupButtonProps) {
  const [open, setOpen] = useState(false);
  const form = useFormContext<ResourceInput<T>>();
  const alert = useAlert();
  useErrorHandler(form, alert);

  return (
    <>
      <ToolbarSaveButton
        isDirty={form.formState.isDirty}
        onClick={() => {
          setOpen(true);
        }}
      />
      <DialogLayout
        title={title}
        open={open}
        onClose={() => setOpen(false)}
        content={<ResourceSaveForm additionalField={additionalField} />}
      />
    </>
  );
}
