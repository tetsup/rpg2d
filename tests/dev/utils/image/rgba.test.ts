import { describe, it, expect } from 'vitest';
import { rgbaArrayToUint8 } from '@dev/utils/image/rgba';

describe('rgbaArrayToUint8', () => {
  it('number[][] を Uint8Array に変換できる', () => {
    const input = [
      [255, 0, 0, 255],
      [0, 255, 0, 255],
    ];

    const out = rgbaArrayToUint8(input);

    expect(Array.from(out)).toEqual([255, 0, 0, 255, 0, 255, 0, 255]);
  });
});
