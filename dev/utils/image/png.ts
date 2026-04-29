import type { Size2d } from '@/types/engine';

export async function rgbaToPng(size: Size2d, rgba: Uint8Array): Promise<ArrayBuffer> {
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;

  const ctx = canvas.getContext('2d')!;

  const imageData = new ImageData(
    new Uint8ClampedArray(rgba.buffer as ArrayBuffer, rgba.byteOffset, rgba.byteLength),
    size.width,
    size.height
  );

  ctx.putImageData(imageData, 0, 0);

  const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));

  return blob.arrayBuffer();
}
