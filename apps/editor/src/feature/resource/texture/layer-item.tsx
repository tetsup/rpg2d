import { useState } from 'react';
import { type FieldPathByValue, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Construction } from 'lucide-react';
import type { ImageLayer } from '@sharedTypes/engine';
import { GridItem } from '@base/components/grid-list/grid-item';
import { PreviewCard } from '@base/components/form-control/preview-card';
import { ResourcePreviewCard } from '@editor/shared/components/form-control/resource-preview-card';
import { LayerDialog } from './layer-dialog';

type LayerItemProps = {
  name: FieldPathByValue<any, ImageLayer>;
  onRemove: () => void;
};

function EmptyCard() {
  const { t } = useTranslation();

  return <PreviewCard renderImage={() => <Construction size={24} />} label={t('設定してください')} />;
}

export function LayerItem({ name, onRemove }: LayerItemProps) {
  const [open, setOpen] = useState(false);
  const { watch } = useFormContext();
  const imageId = watch(`${name}.image`);

  return (
    <>
      <GridItem
        onClick={() => {
          setOpen(true);
        }}
      >
        {imageId ? <ResourcePreviewCard id={imageId} /> : <EmptyCard />}
      </GridItem>
      <LayerDialog
        name={name}
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        onRemove={onRemove}
      />
    </>
  );
}
