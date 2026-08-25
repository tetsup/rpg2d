import type { Point2d } from '@sharedTypes/engine';

type ImageWithId = { imageId: string; imageData: ImageBitmap };

type ImageObject = {
  pos: Point2d;
  imageId: string;
};

export class PreviewRenderer {
  private readonly images = new Map<string, ImageBitmap>();

  constructor(private readonly canvas: HTMLCanvasElement) {}

  registerImage = ({ imageId, imageData }: ImageWithId) => {
    this.images.set(imageId, imageData);
  };

  render = (imageObjects: ImageObject[]) => {
    const context = this.canvas.getContext('2d');
    if (!context) throw new Error('Failed to get 2d context');

    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    imageObjects.forEach((imageObject) => {
      const image = this.images.get(imageObject.imageId);
      if (image === undefined) return;

      context.drawImage(image, imageObject.pos.x, imageObject.pos.y);
    });
  };

  dispose = () => {
    this.images.forEach((image) => {
      image.close();
    });
    this.images.clear();
  };
}
