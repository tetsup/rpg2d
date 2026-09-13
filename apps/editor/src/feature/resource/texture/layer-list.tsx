import { type FieldArrayPathByValue, useFieldArray, useFormContext } from 'react-hook-form';
import type { ImageLayer } from '@sharedTypes/engine';
import { GridAddButton } from '@base/components/grid-list/grid-add-button';
import { GridStacker } from '@base/components/grid-list/grid-stacker';
import { buildLayerData } from '@editor/factory/texture';
import { LayerItem } from './layer-item';

type LayerListProps = {
  name: FieldArrayPathByValue<any, ImageLayer>;
};

export function LayerList({ name }: LayerListProps) {
  const { control } = useFormContext();
  const {
    fields: layers,
    append,
    remove,
  } = useFieldArray({
    control,
    name,
  });
  return (
    <GridStacker>
      {layers.map((_, index) => (
        <LayerItem key={index} name={`${name}.${index}`} onRemove={() => remove(index)} />
      ))}
      <GridAddButton height={28} onClick={() => append(buildLayerData(), { shouldFocus: false })} />
    </GridStacker>
  );
}
