import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CollectionName, Database } from '@sharedTypes/database/collection';
import { Button } from '@editor/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@editor/components/ui/dialog';
import { SelectDocument } from './select-document';

type DocumentPickerProps<T extends CollectionName> = {
  collectionName: T;
  id?: string;
  onSelect: (document: Database[T]) => void;
  onCreate?: () => void;
};

export function DocumentPicker({ collectionName, id, onSelect, onCreate }: DocumentPickerProps<any>) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" className="w-full justify-between">
            <span>{id ?? t('未選択')}</span>
          </Button>
        }
      />
      <DialogContent className="p-0 overflow-hidden">
        <DialogHeader className="p-4">
          <DialogTitle>{t('選択するか、新規作成してください')}</DialogTitle>
        </DialogHeader>
        <SelectDocument collectionName={collectionName} onItemSelect={onSelect} />
        {onCreate && (
          <div className="p-2 border-t">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                onCreate();
                setOpen(false);
              }}
            >
              +{t('新規作成')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
