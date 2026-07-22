import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { FilterMap } from '@sharedTypes/database/filter';
import type { ResourceType } from '@sharedTypes/resource/common';
import { Button } from '@base/components/ui/button';
import { DocumentListItemContent } from './document-list-item-content';
import { DocumentPickerDialog } from './document-picker-dialog';
import { isThumbnailPickerResourceType } from '../lib/resource-type-meta';
import { useResolvedDocument } from '../api/hooks/resolved-document';
import { renderDocumentLabel } from '../lib/document-label';
import { buildRenderItemContext } from '../lib/document-item';

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
    <>
      <Button
        id={id}
        type="button"
        variant="outline"
        className="h-auto min-h-10 w-full justify-start gap-2 py-2"
        onClick={() => setOpen(true)}
      >
        {selectedItemContent}
      </Button>
      <DocumentPickerDialog
        open={open}
        onOpenChange={setOpen}
        title={t('選択するか、新規作成してください')}
        collectionName={collectionName}
        onSelect={onSelect}
        onCreate={onCreate}
        resourceType={resourceType}
      />
    </>
  );
}
