/**
 * 対象:
 * - resolvePlayerLayers
 * - resolveEntitiesLayers
 * - retrieveLayers
 * - sortLayers
 * - calcViewPort
 *
 * 方針:
 * - 依存は基本そのまま利用（Rect / shiftPos）
 * - 実際の戻り値を検証
 * - 将来のリファクタで壊れやすい境界条件も追加
 */

import {
  resolvePlayerLayers,
  resolveEntitiesLayers,
  retrieveLayers,
  sortLayers,
  calcViewPort,
} from '@/engine/field/layer-resolver';

import { Rect } from '@/utils/rect';

describe('resolvePlayerLayers', () => {
  const config = {
    blockSize: {
      width: 16,
      height: 24,
    },
  };

  it('プレイヤー1人・レイヤー1枚を screen 座標で返す', () => {
    const state: any = {
      players: [
        {
          skin: {
            resolveLayers: () => [{ image: 'hero', priority: 10 }],
          },
        },
      ],
      playerPos: {
        direction: 'down',
        getCurrentPixel: () => ({ x: 100, y: 200 }),
      },
    };

    const viewport = new Rect(80, 150, 320, 240);

    const result = resolvePlayerLayers(1000, viewport, state, config as any);

    expect(result).toHaveLength(1);
    expect(result[0].layer.image).toBe('hero');
    expect(result[0].rect.left).toBe(20);
    expect(result[0].rect.top).toBe(50);
    expect(result[0].rect.width).toBe(16);
    expect(result[0].rect.height).toBe(24);
  });

  it('プレイヤーskinが複数レイヤーなら flatMap される', () => {
    const state: any = {
      players: [
        {
          skin: {
            resolveLayers: () => [
              { image: 'body', priority: 1 },
              { image: 'head', priority: 2 },
            ],
          },
        },
      ],
      playerPos: {
        direction: 'down',
        getCurrentPixel: () => ({ x: 0, y: 0 }),
      },
    };

    const result = resolvePlayerLayers(0, new Rect(0, 0, 100, 100), state, config as any);

    expect(result).toHaveLength(2);
    expect(result.map((v) => v.layer.image)).toEqual(['body', 'head']);
  });

  it('players が複数なら人数分展開される', () => {
    const state: any = {
      players: [
        {
          skin: { resolveLayers: () => [{ image: 'a', priority: 1 }] },
        },
        {
          skin: { resolveLayers: () => [{ image: 'b', priority: 1 }] },
        },
      ],
      playerPos: {
        direction: 'down',
        getCurrentPixel: () => ({ x: 0, y: 0 }),
      },
    };

    const result = resolvePlayerLayers(0, new Rect(0, 0, 10, 10), state, config as any);

    expect(result).toHaveLength(2);
  });
});

describe('resolveEntitiesLayers', () => {
  const config = {
    blockSize: {
      width: 16,
      height: 16,
    },
  };

  it('visible=false は除外される', () => {
    const state: any = {
      entities: {
        a: {
          state: {
            visible: false,
            pos: {
              getCurrentPixel: () => ({ x: 0, y: 0 }),
            },
          },
        },
      },
    };

    const result = resolveEntitiesLayers(0, new Rect(0, 0, 100, 100), state, config as any);

    expect(result).toEqual([]);
  });

  it('viewport 外エンティティは除外される', () => {
    const state: any = {
      entities: {
        a: {
          state: {
            visible: true,
            pos: {
              getCurrentPixel: () => ({ x: 999, y: 999 }),
            },
          },
          resolveLayers: () => [{ image: 'npc', priority: 1 }],
        },
      },
    };

    const result = resolveEntitiesLayers(0, new Rect(0, 0, 100, 100), state, config as any);

    expect(result).toEqual([]);
  });

  it('viewport 内なら screen 座標に変換される', () => {
    const state: any = {
      entities: {
        a: {
          state: {
            visible: true,
            pos: {
              getCurrentPixel: () => ({ x: 40, y: 60 }),
            },
          },
          resolveLayers: () => [{ image: 'npc', priority: 3 }],
        },
      },
    };

    const viewport = new Rect(20, 30, 100, 100);

    const result = resolveEntitiesLayers(0, viewport, state, config as any);

    expect(result).toHaveLength(1);
    expect(result[0].rect.left).toBe(20);
    expect(result[0].rect.top).toBe(30);
    expect(result[0].layer.image).toBe('npc');
  });

  it('entity layers が複数なら展開される', () => {
    const state: any = {
      entities: {
        a: {
          state: {
            visible: true,
            pos: {
              getCurrentPixel: () => ({ x: 0, y: 0 }),
            },
          },
          resolveLayers: () => [
            { image: 'body', priority: 1 },
            { image: 'head', priority: 2 },
          ],
        },
      },
    };

    const result = resolveEntitiesLayers(0, new Rect(-10, -10, 100, 100), state, config as any);

    expect(result).toHaveLength(2);
  });
});

describe('retrieveLayers', () => {
  const config = {
    blockSize: { width: 16, height: 16 },
  };

  it('player + entity + tile を結合する', () => {
    const state: any = {
      players: [],
      entities: {},
      playerPos: {
        direction: 'down',
        getCurrentPixel: () => ({ x: 0, y: 0 }),
      },
    };

    const field: any = {
      resolveLayers: () => [{ rect: {}, layer: { image: 'tile', priority: 0 } }],
    };

    const result = retrieveLayers(0, new Rect(0, 0, 100, 100), state, config as any, field);

    expect(result).toHaveLength(1);
    expect(result[0].layer.image).toBe('tile');
  });
});

describe('sortLayers', () => {
  it('priority 昇順でソートする', () => {
    const layers: any = [{ layer: { priority: 30 } }, { layer: { priority: 10 } }, { layer: { priority: 20 } }];

    const result = sortLayers(layers);

    expect(result.map((v: any) => v.layer.priority)).toEqual([10, 20, 30]);
  });

  it('同priorityでも落ちない', () => {
    const layers: any = [{ layer: { priority: 1 } }, { layer: { priority: 1 } }];

    expect(sortLayers(layers)).toHaveLength(2);
  });
});

describe('calcViewPort', () => {
  it('プレイヤー中心が viewport 中心になる', () => {
    const state: any = {
      playerPos: {
        getCurrentPixel: () => ({ x: 100, y: 200 }),
      },
    };

    const ctx: any = {
      manifest: {
        config: {
          blockSize: {
            width: 16,
            height: 24,
          },
          screen: {
            width: 320,
            height: 240,
          },
        },
      },
    };

    const viewport = calcViewPort(0, state, ctx);

    expect(viewport.left).toBe(-52);
    expect(viewport.top).toBe(92);
    expect(viewport.width).toBe(320);
    expect(viewport.height).toBe(240);
  });

  it('screen size をそのまま使う', () => {
    const state: any = {
      playerPos: {
        getCurrentPixel: () => ({ x: 0, y: 0 }),
      },
    };

    const ctx: any = {
      manifest: {
        config: {
          blockSize: {
            width: 16,
            height: 16,
          },
          screen: {
            width: 640,
            height: 480,
          },
        },
      },
    };

    const viewport = calcViewPort(0, state, ctx);

    expect(viewport.width).toBe(640);
    expect(viewport.height).toBe(480);
  });

  it('奇数サイズでも bitshift floor で計算される', () => {
    const state: any = {
      playerPos: {
        getCurrentPixel: () => ({ x: 0, y: 0 }),
      },
    };

    const ctx: any = {
      manifest: {
        config: {
          blockSize: {
            width: 15,
            height: 15,
          },
          screen: {
            width: 101,
            height: 51,
          },
        },
      },
    };

    const viewport = calcViewPort(0, state, ctx);

    expect(viewport.width).toBe(101);
    expect(viewport.height).toBe(51);
  });
});
