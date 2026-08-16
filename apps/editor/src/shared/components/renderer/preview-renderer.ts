import type { LayerWithPos } from '@sharedTypes/engine';
import { Rect } from '@engine/utils/rect';

type RegisteredImage = {
  imageData: ImageBitmap;
};

export class PreviewRenderer {
  private readonly images = new Map<string, RegisteredImage>();

  constructor(private readonly canvas: HTMLCanvasElement) {
    const context = this.canvas.getContext('2d');

    if (!context) {
      throw new Error('Failed to create 2d rendering context');
    }

    context.imageSmoothingEnabled = false;
  }

  registerImage = ({ imageId, imageData }: { imageId: string; imageData: ImageBitmap }) => {
    const previous = this.images.get(imageId);

    if (previous?.imageData !== imageData) {
      previous?.imageData.close();
    }

    this.images.set(imageId, { imageData });
  };

  hasImage = (imageId: string) => {
    return this.images.has(imageId);
  };

  getImage = (imageId: string) => {
    return this.images.get(imageId)?.imageData;
  };

  renderLayers = (layers: LayerWithPos[]) => {
    const context = this.canvas.getContext('2d');

    if (!context) return;

    if (layers.length === 0) {
      this.clear();
      return;
    }

    const sortedLayers = [...layers].sort((a, b) => a.layer.priority - b.layer.priority);

    const bounds = this.getBounds(sortedLayers);

    this.resize(bounds.width, bounds.height);
    this.clear();

    context.imageSmoothingEnabled = false;

    for (const { rect, layer } of sortedLayers) {
      const image = this.images.get(layer.image)?.imageData;

      if (!image) continue;

      context.drawImage(image, rect.left - bounds.left, rect.top - bounds.top, rect.width, rect.height);
    }
  };

  clear = () => {
    const context = this.canvas.getContext('2d');

    if (!context) return;

    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  dispose = () => {
    for (const { imageData } of this.images.values()) {
      imageData.close();
    }

    this.images.clear();
  };

  private resize = (width: number, height: number) => {
    const nextWidth = Math.max(0, Math.ceil(width));
    const nextHeight = Math.max(0, Math.ceil(height));

    if (this.canvas.width === nextWidth && this.canvas.height === nextHeight) {
      return;
    }

    this.canvas.width = nextWidth;
    this.canvas.height = nextHeight;

    const context = this.canvas.getContext('2d');

    if (!context) return;

    context.imageSmoothingEnabled = false;
  };

  private getBounds = (layers: LayerWithPos[]): Rect => {
    const first = layers[0];

    if (!first) {
      return new Rect(0, 0, 0, 0);
    }

    let left = first.rect.left;
    let top = first.rect.top;
    let right = first.rect.right;
    let bottom = first.rect.bottom;

    for (const { rect } of layers.slice(1)) {
      left = Math.min(left, rect.left);
      top = Math.min(top, rect.top);
      right = Math.max(right, rect.right);
      bottom = Math.max(bottom, rect.bottom);
    }

    return new Rect(left, top, right - left, bottom - top);
  };
}
