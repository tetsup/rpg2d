import { ImageData } from '@sharedTypes/resource/image';

export function buildImageData(data: Partial<ImageData>): ImageData {
  return {
    size: { width: 16, height: 16 },
    palette: {
      '00': [255, 255, 255, 255],
      ff: [0, 0, 0, 0],
    },
    pixels: [
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
    ],
    ...data,
  };
}
