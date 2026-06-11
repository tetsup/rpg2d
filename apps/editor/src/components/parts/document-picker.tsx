import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@editor/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@editor/components/ui/dialog';

type DocumentPickerProps<T> = {
  id?: string;
  onSelect: (document: T) => void;
  onCreate?: () => void;
  renderSelect: ({ onSelect }: { onSelect: (document: T) => void }) => ReactNode;
};

export function DocumentPicker({ id, onSelect, onCreate, renderSelect }: DocumentPickerProps<any>) {
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
        {renderSelect({ onSelect })}
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
