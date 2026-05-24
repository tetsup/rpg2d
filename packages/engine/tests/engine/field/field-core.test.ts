/**
 * 方針:
 * - FieldEngine 本体の責務だけをテスト
 * - 移動判定 / レイヤー解決 / viewport 計算 / 入力方向判定は依存モジュールをモック
 * - それら個別アルゴリズムは各モジュール単体テストへ移管
 *
 * 既存テストで以下はこのファイルから外してください:
 * - movePlayer の内部判定詳細 → movement-controller.spec.ts
 * - moveEntity の内部判定詳細 → movement-controller.spec.ts
 * - resolveMove のキー優先順位 → resolve-move.spec.ts
 * - calcViewPort の座標演算 → calc-viewport.spec.ts
 * - resolveEntitiesLayers / retrieveLayers / sortLayers → layer-resolver.spec.ts
 */
import { FieldEngine } from '@engine/manager/field/field-core';
import { DEFAULT_RPG_KEYS, InputEngine } from '@engine/manager/input/input-engine';

vi.mock('@engine/manager/field/layer-resolver', () => ({
  resolveEntitiesLayers: vi.fn(),
  resolvePlayerLayers: vi.fn(),
  retrieveLayers: vi.fn(),
  sortLayers: vi.fn(),
  calcViewPort: vi.fn(),
}));

vi.mock('@engine/manager/field/movement-controller', () => ({
  moveEntity: vi.fn(),
  movePlayer: vi.fn(),
  resolveMove: vi.fn(),
}));

import {
  resolveEntitiesLayers,
  resolvePlayerLayers,
  retrieveLayers,
  sortLayers,
  calcViewPort,
} from '@engine/manager/field/layer-resolver';

import { moveEntity, movePlayer, resolveMove } from '@engine/manager/field/movement-controller';
import type { LayerWithPos, RpgKey } from '@sharedTypes/engine';

describe('FieldEngine', () => {
  let ctx: any;
  let field: any;
  let state: any;
  let actionManager: any;
  let renderer: any;
  let inputState: Partial<Record<RpgKey, boolean>>;
  let rawInput: any;
  let input: InputEngine<RpgKey>;
  let engine: FieldEngine;

  const emptyLayers: LayerWithPos[] = [];

  beforeEach(() => {
    vi.clearAllMocks();

    ctx = {
      manifest: {
        config: {
          blockSize: 16,
        },
      },
    };

    field = {
      id: 'field1',
    };

    state = {
      playerPos: {
        current: { x: 5, y: 6 },
        direction: 'down',
        tick: vi.fn(),
      },
      players: [],
      actions: {},
      entities: {},
    };

    actionManager = {
      start: vi.fn(),
    };

    renderer = {
      render: vi.fn(),
    };

    inputState = {};
    rawInput = {
      isPressed: vi.fn((key: RpgKey) => inputState[key] === true),
    };
    input = new InputEngine<RpgKey>(DEFAULT_RPG_KEYS);

    (calcViewPort as any).mockReturnValue({
      left: 0,
      top: 0,
      width: 320,
      height: 240,
    });

    (retrieveLayers as any).mockReturnValue(emptyLayers);
    (sortLayers as any).mockReturnValue(emptyLayers);
    (resolveEntitiesLayers as any).mockReturnValue(emptyLayers);
    (resolvePlayerLayers as any).mockReturnValue(emptyLayers);

    (resolveMove as any).mockReturnValue(null);

    engine = new FieldEngine(ctx, field, state, actionManager);
  });

  const tickInput = (nowMs: number) => {
    input.tick(nowMs, rawInput);
    return input;
  };

  describe('delegate methods', () => {
    it('movePlayer を委譲', () => {
      engine.movePlayer(1000, { command: 'walk' } as any);

      expect(movePlayer).toHaveBeenCalled();
    });

    it('moveEntity を委譲', () => {
      engine.moveEntity(1000, 'npc1', { command: 'walk' } as any);

      expect(moveEntity).toHaveBeenCalled();
    });
  });

  describe('checkTargetEntity / onCheck', () => {
    it('正面の visible entity を取得', () => {
      state.entities = {
        npc1: {
          state: {
            visible: true,
            pos: {
              getDestination: () => ({ x: 5, y: 7 }),
            },
          },
        },
      };

      engine = new FieldEngine(ctx, field, state, actionManager);

      expect(engine.checkTargetEntity()).toBe(state.entities.npc1);
    });

    it('visible=false は除外', () => {
      state.entities = {
        npc1: {
          state: {
            visible: false,
            pos: {
              getDestination: () => ({ x: 5, y: 7 }),
            },
          },
        },
      };

      engine = new FieldEngine(ctx, field, state, actionManager);

      expect(engine.checkTargetEntity()).toBeUndefined();
    });

    it('onCheck で start(action)', () => {
      const action = { id: 'talk' };

      state.entities = {
        npc1: {
          state: {
            visible: true,
            pos: {
              getDestination: () => ({ x: 5, y: 7 }),
            },
          },
          getAction: vi.fn(() => action),
        },
      };

      engine = new FieldEngine(ctx, field, state, actionManager);

      engine.onCheck();

      expect(actionManager.start).toHaveBeenCalledWith(action);
    });

    it('action 無しなら start しない', () => {
      state.entities = {
        npc1: {
          state: {
            visible: true,
            pos: {
              getDestination: () => ({ x: 5, y: 7 }),
            },
          },
          getAction: vi.fn(() => undefined),
        },
      };

      engine = new FieldEngine(ctx, field, state, actionManager);

      engine.onCheck();

      expect(actionManager.start).not.toHaveBeenCalled();
    });
  });

  describe('onTick', () => {
    it('enter押下瞬間のみ onCheck', () => {
      const spy = vi.spyOn(engine, 'onCheck');

      inputState.enter = true;
      engine.onTick(tickInput(1000), 1000, renderer);

      engine.onTick(tickInput(1016), 1016, renderer);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('playerPos.tick(nowMs)', () => {
      engine.onTick(tickInput(1000), 1000, renderer);

      expect(state.playerPos.tick).toHaveBeenCalledWith(1000);
    });

    it('entity.pos.tick(nowMs)', () => {
      state.entities = {
        a: { state: { pos: { tick: vi.fn() } } },
        b: { state: { pos: { tick: vi.fn() } } },
      };

      engine = new FieldEngine(ctx, field, state, actionManager);

      engine.onTick(tickInput(1000), 1000, renderer);

      expect(state.entities.a.state.pos.tick).toHaveBeenCalledWith(1000);
      expect(state.entities.b.state.pos.tick).toHaveBeenCalledWith(1000);
    });

    it('移動方向ありなら movePlayer', () => {
      (resolveMove as any).mockImplementation((input: InputEngine<RpgKey>) => input.resolveDirection());
      inputState.left = true;

      engine.onTick(tickInput(1000), 1000, renderer);

      expect(movePlayer).toHaveBeenCalled();
    });

    it('renderField が呼ばれる', () => {
      const spy = vi.spyOn(engine, 'renderField');

      engine.onTick(tickInput(1000), 1000, renderer);

      expect(spy).toHaveBeenCalledWith(1000, renderer);
    });
  });

  describe('renderField / renderLayers', () => {
    it('calcViewPort → retrieveLayers → sortLayers', () => {
      const viewport = { left: 0, top: 0 };
      const layers = [
        {
          rect: { left: 10, top: 20 },
          layer: { image: 'hero.png' },
        },
      ];

      (calcViewPort as any).mockReturnValue(viewport);
      (retrieveLayers as any).mockReturnValue(layers);
      (sortLayers as any).mockReturnValue(layers);

      engine.renderField(1000, renderer);

      expect(calcViewPort).toHaveBeenCalled();
      expect(retrieveLayers).toHaveBeenCalled();
      expect(sortLayers).toHaveBeenCalled();
    });

    it('renderLayers は renderer.render 形式へ変換', () => {
      engine.renderLayers(
        [
          {
            rect: { left: 10, top: 20 },
            layer: { image: 'hero.png' },
          },
        ] as any,
        renderer
      );

      expect(renderer.render).toHaveBeenCalledWith([
        {
          pos: { x: 10, y: 20 },
          imageId: 'hero.png',
        },
      ]);
    });

    it('retrieveSortedLayers は sort後を返す', () => {
      const sorted = [{ id: 1 }];

      (sortLayers as any).mockReturnValue(sorted);

      expect(engine.retrieveSortedLayers(1000)).toBe(sorted);
    });
  });

  describe('layer delegate', () => {
    it('resolvePlayerLayers を委譲', () => {
      engine.resolvePlayerLayers(1000, {} as any);

      expect(resolvePlayerLayers).toHaveBeenCalled();
    });

    it('resolveEntitiesLayers を委譲', () => {
      engine.resolveEntitiesLayers(1000, {} as any);

      expect(resolveEntitiesLayers).toHaveBeenCalled();
    });

    it('retrieveLayers を委譲', () => {
      engine.retrieveLayers(1000, {} as any);

      expect(retrieveLayers).toHaveBeenCalled();
    });
  });
});
