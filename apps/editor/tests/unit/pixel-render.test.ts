import { describe, expect, it } from 'vitest';
import {
  getCompositeCanvasSize,
  getTextureCompositeImageIds,
  type ImagePixelData,
} from '@editor/lib/pixel-render';

const sampleImage: ImagePixelData = {
  size: { width: 2, height: 2 },
  palette: {
    aa: [255, 0, 0, 255],
    bb: [0, 255, 0, 255],
  },
  pixels: ['aa bb', 'bb aa'],
};

describe('pixel-render', () => {
  it('returns composite canvas size from images', () => {
    expect(getCompositeCanvasSize([])).toEqual({ width: 0, height: 0 });
    expect(getCompositeCanvasSize([sampleImage])).toEqual({ width: 2, height: 2 });
  });

  it('picks the first image id per layer sorted by priority', () => {
    const imageIds = getTextureCompositeImageIds({
      layers: [
        { priority: 1, images: ['b/image/frame2.v0', null] },
        { priority: 0, images: ['b/image/frame1.v0', 'b/image/frame1b.v0'] },
      ],
    });

    expect(imageIds).toEqual(['b/image/frame1.v0', 'b/image/frame2.v0']);
  });

  it('skips layers without a resolved first image id', () => {
    const imageIds = getTextureCompositeImageIds({
      layers: [
        { priority: 0, images: [null] },
        { priority: 1, images: [] },
      ],
    });

    expect(imageIds).toEqual([]);
  });
});
