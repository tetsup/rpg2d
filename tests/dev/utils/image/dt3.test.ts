import { describe, it, expect } from 'vitest';
import { dt3ToRgba } from '@dev/utils/image/dt3';

describe('dt3ToRgba', () => {
  it('DT3フォーマットをRGBAに変換できる', () => {
    const dt3 = `1,2:0,1:${0xff0000},${0x00ff00}:999`;

    const { size, rgba } = dt3ToRgba(dt3);

    expect(size).toEqual({ width: 2, height: 1 });
    expect(Array.from(rgba)).toEqual([255, 0, 0, 255, 0, 255, 0, 255]);
  });

  it('transparent指定がalphaに反映される', () => {
    const dt3 = `1,2:0,1:${0xff0000},${0x00ff00}:1`;

    const { rgba } = dt3ToRgba(dt3);

    expect(Array.from(rgba)).toEqual([255, 0, 0, 255, 0, 255, 0, 0]);
  });
});
