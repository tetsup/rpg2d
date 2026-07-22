import { useTranslation } from 'react-i18next';
import type { FilterMap } from '@sharedTypes/database/filter';
import type { ResourceType } from '@sharedTypes/resource/common';
import { Button } from '@base/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@base/components/ui/dialog';
import { SelectDocument } from './select-document';

type DocumentPickerDialogProps<T extends keyof FilterMap> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  collectionName: T;
  onSelect: (id: string) => void;
  onCreate?: () => void;
  resourceType?: ResourceType;
};

export function DocumentPickerDialog<T extends keyof FilterMap>({
  open,
  onOpenChange,
  title,
  collectionName,
  onSelect,
  onCreate,
  resourceType,
}: DocumentPickerDialogProps<T>) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden">
        <DialogHeader className="p-4">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <SelectDocument
          collectionName={collectionName}
          onItemSelect={(item) => {
            onSelect(item.id);
            onOpenChange(false);
          }}
          resourceType={resourceType}
        />
        {onCreate && (
          <div className="border-t p-2">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                onCreate();
                onOpenChange(false);
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
