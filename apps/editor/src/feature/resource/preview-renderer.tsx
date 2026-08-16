import type { LayerWithPos } from '@sharedTypes/engine';
import { Rect } from '@engine/utils/rect';

export class PreviewRenderer {
  private readonly context: CanvasRenderingContext2D;
  private readonly images = new Map<string, ImageBitmap>();

  constructor(private readonly canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Failed to create 2d rendering context');
    }

    this.context = context;
    this.context.imageSmoothingEnabled = false;
  }

  registerImage = (imageId: string, image: ImageBitmap) => {
    const previous = this.images.get(imageId);

    if (previous && previous !== image) {
      previous.close();
    }

    this.images.set(imageId, image);
  };

  hasImage = (imageId: string) => {
    return this.images.has(imageId);
  };

  renderLayers = (layers: LayerWithPos[]) => {
    if (layers.length === 0) {
      this.resize(0, 0);
      return;
    }

    const sortedLayers = [...layers].sort((a, b) => a.layer.priority - b.layer.priority);

    const bounds = this.calculateBounds(sortedLayers);

    this.resize(bounds.width, bounds.height);

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const { rect, layer } of sortedLayers) {
      const image = this.images.get(layer.image);

      if (!image) continue;

      this.context.drawImage(image, rect.left - bounds.left, rect.top - bounds.top, rect.width, rect.height);
    }
  };

  clear = () => {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  dispose = () => {
    for (const image of this.images.values()) {
      image.close();
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

    this.context.imageSmoothingEnabled = false;
  };

  private calculateBounds = (layers: LayerWithPos[]): Rect => {
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
