import { ImageLayer } from '@sharedTypes/engine';
import { buildLayerData } from '@editor/factory/texture';
import { StyledButton } from '@base/components/form-control/styled-button';

type AddLayerButtonProps = { onAppend: (data: ImageLayer) => void };

export function AddLayerButton({ onAppend }: AddLayerButtonProps) {
  const handleAdd = () => {
    onAppend(buildLayerData());
  };

  return <StyledButton variant="outline" onClick={handleAdd} />;
}
