import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DocumentPicker } from '@editor/components/parts/document-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@editor/components/ui/dialog';

type ManifestPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (manifestId: string) => void;
};

export function ManifestPickerDialog({ open, onOpenChange, onSelect }: ManifestPickerDialogProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden">
        <DialogHeader className="p-4">
          <DialogTitle>{t('マニフェストを選択')}</DialogTitle>
        </DialogHeader>
        <DocumentPicker
          collectionName="resources"
          resourceType="manifest"
          onSelect={(id) => {
            onSelect(id);
            onOpenChange(false);
          }}
          onCreate={() => {
            onOpenChange(false);
            navigate('/resources/manifest/new');
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
