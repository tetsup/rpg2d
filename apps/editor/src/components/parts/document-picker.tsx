import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { FilterMap } from '@sharedTypes/database/filter';
import type { ResourceType } from '@sharedTypes/resource/common';
import { renderDocumentLabel } from '@editor/lib/document-label';
import { buildRenderItemContext } from '@editor/lib/document-item';
import { isThumbnailPickerResourceType } from '@editor/lib/resource-type-meta';
import { useResolvedDocument } from '@editor/hooks/api/resolved-document';
import { Button } from '@editor/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@editor/components/ui/dialog';
import { DocumentListItemContent } from './document-list-item-content';
import { SelectDocument } from './select-document';

type DocumentPickerProps<T extends keyof FilterMap> = {
  collectionName: T;
  id?: string;
  value?: string;
  onSelect: (id: string) => void;
  onCreate?: () => void;
  resourceType?: ResourceType;
  showThumbnail?: boolean;
};

export function DocumentPicker<T extends keyof FilterMap>({
  collectionName,
  id,
  value,
  onSelect,
  onCreate,
  resourceType,
  showThumbnail = resourceType != null && isThumbnailPickerResourceType(resourceType),
}: DocumentPickerProps<T>) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const selectedDocument = useResolvedDocument(collectionName, value);
  const displayLabel = useMemo(() => {
    if (selectedDocument) return renderDocumentLabel(collectionName, selectedDocument);
    if (value) return value;
    return t('未選択');
  }, [collectionName, value, selectedDocument, t]);
  const selectedItemContent = useMemo(() => {
    if (!showThumbnail || selectedDocument == null) {
      return <span className="truncate">{displayLabel}</span>;
    }

    const { label, thumbnail } = buildRenderItemContext(collectionName, selectedDocument);
    return <DocumentListItemContent label={label} thumbnail={thumbnail} size="md" />;
  }, [collectionName, displayLabel, selectedDocument, showThumbnail]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button id={id} variant="outline" className="h-auto min-h-10 w-full justify-start gap-2 py-2">
            {selectedItemContent}
          </Button>
        }
      />
      <DialogContent className="p-0 overflow-hidden">
        <DialogHeader className="p-4">
          <DialogTitle>{t('選択するか、新規作成してください')}</DialogTitle>
        </DialogHeader>
        <SelectDocument
          collectionName={collectionName}
          onItemSelect={(item) => {
            onSelect(item.id);
            setOpen(false);
          }}
          resourceType={resourceType}
        />
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
