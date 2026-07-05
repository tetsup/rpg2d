import type { ResourceDocument } from '@sharedTypes/database/collection';

export type ImagePixelData = ResourceDocument<'image'>['data'];

export function getTextureCompositeImageIds(texture: {
  layers: Array<{ priority: number; images: Array<string | null> }>;
}): string[] {
  return [...texture.layers]
    .sort((a, b) => a.priority - b.priority)
    .flatMap((layer) => {
      const first = layer.images.find((id): id is string => id != null);
      return first ? [first] : [];
    });
}

export function drawImageData(
  ctx: CanvasRenderingContext2D,
  image: ImagePixelData,
  x: number,
  y: number
): void {
  const { width, height } = image.size;
  const imageData = ctx.createImageData(width, height);
  image.pixels.forEach((row, rowY) => {
    row.split(/\s+/).forEach((token, colX) => {
      const rgba = image.palette[token];
      if (!rgba) return;
      const i = (rowY * width + colX) * 4;
      imageData.data[i] = rgba[0];
      imageData.data[i + 1] = rgba[1];
      imageData.data[i + 2] = rgba[2];
      imageData.data[i + 3] = rgba[3];
    });
  });
  const layerCanvas = document.createElement('canvas');
  layerCanvas.width = width;
  layerCanvas.height = height;
  layerCanvas.getContext('2d')!.putImageData(imageData, 0, 0);
  ctx.drawImage(layerCanvas, x, y);
}

export function getCompositeCanvasSize(images: ImagePixelData[]): { width: number; height: number } {
  if (images.length === 0) return { width: 0, height: 0 };
  return {
    width: Math.max(...images.map((image) => image.size.width)),
    height: Math.max(...images.map((image) => image.size.height)),
  };
}

const PIXEL_GRID_CHECKER_LIGHT = '#e8e8e8';
const PIXEL_GRID_CHECKER_DARK = '#c8c8c8';
const PIXEL_GRID_LINE = 'rgba(0, 0, 0, 0.2)';

export function drawPixelEditorBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? PIXEL_GRID_CHECKER_LIGHT : PIXEL_GRID_CHECKER_DARK;
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

export function drawPixelGrid(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  if (width === 0 || height === 0) return;

  ctx.save();
  ctx.strokeStyle = PIXEL_GRID_LINE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= width; x++) {
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
  }
  for (let y = 0; y <= height; y++) {
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(width, y + 0.5);
  }
  ctx.stroke();
  ctx.restore();
}

type DrawCompositeOptions = {
  showPixelGrid?: boolean;
};

export function drawCompositeImages(
  ctx: CanvasRenderingContext2D,
  images: ImagePixelData[],
  width: number,
  height: number,
  options: DrawCompositeOptions = {}
): void {
  ctx.clearRect(0, 0, width, height);
  if (options.showPixelGrid) {
    drawPixelEditorBackground(ctx, width, height);
  }
  for (const image of images) {
    drawImageData(ctx, image, 0, 0);
  }
  if (options.showPixelGrid) {
    drawPixelGrid(ctx, width, height);
  }
}
