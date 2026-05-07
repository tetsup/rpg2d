/**
 * tests/engine/field.test.ts
 *
 * FieldEngine のユニットテスト。
 * 実装コードは変更せず、設計上の問題を浮き彫りにするために「意図した動作」でテストを書く。
 * 失敗するテストは実装バグを示す。
 */

import type { InputManager, GameRenderer } from '@tetsup/web2d';
import { FieldEngine } from '@/engine/field/field-core';
import type { FieldPos } from '@/engine/field/field-pos';
import type { EntityInstance } from '@/engine/entity';
import { Rect } from '@/utils/rect';
import { Queue } from '@/utils/queue';
import type { FieldState } from '@/types/engine';
import type { GameContext } from '@/resource/core/game-context';
import type { Field } from '@/resource/domain/field';
import type { Player } from '@/resource/domain/player';

// ─────────────────────────────────────────────────────────────────────────────
// 定数
// ─────────────────────────────────────────────────────────────────────────────

const NOW_MS = 1000;
const BLOCK_SIZE = { width: 32, height: 32 };
const SCREEN = { width: 320, height: 240 };
const MOVE_DURATION_MS = 200;

// ─────────────────────────────────────────────────────────────────────────────
// モックファクトリ
// ─────────────────────────────────────────────────────────────────────────────

function makeCtx(overrides?: {
  blockSize?: { width: number; height: number };
  screen?: { width: number; height: number };
  moveDurationMs?: number;
}): GameContext {
  return {
    manifest: {
      config: {
        blockSize: overrides?.blockSize ?? BLOCK_SIZE,
        moveDurationMs: overrides?.moveDurationMs ?? MOVE_DURATION_MS,
        screen: overrides?.screen ?? SCREEN,
      },
    },
  } as unknown as GameContext;
}

function makeFieldPos(opts?: {
  current?: { x: number; y: number };
  direction?: 'left' | 'right' | 'up' | 'down';
  currentMovement?: object | null;
  getCurrentPixelResult?: { x: number; y: number };
  getDestinationResult?: { x: number; y: number };
}): FieldPos {
  const o = opts ?? {};
  const current = o.current ?? { x: 0, y: 0 };
  return {
    current,
    direction: o.direction ?? 'down',
    currentMovement: o.currentMovement !== undefined ? o.currentMovement : null,
    move: vi.fn(),
    tick: vi.fn(),
    getCurrentPixel: vi.fn().mockReturnValue(o.getCurrentPixelResult ?? { x: 0, y: 0 }),
    getDestination: vi.fn().mockReturnValue(o.getDestinationResult ?? current),
    setDirection: vi.fn(),
  } as unknown as FieldPos;
}

function makeEntityInstance(opts?: {
  pos?: FieldPos;
  visible?: boolean;
  allowOverwrap?: boolean;
  resolveLayersResult?: object[];
}): EntityInstance {
  const o = opts ?? {};
  const pos = o.pos ?? makeFieldPos();
  return {
    state: {
      pos,
      visible: o.visible !== undefined ? o.visible : true,
      allowOverwrap: o.allowOverwrap !== undefined ? o.allowOverwrap : false,
    },
    resolveLayers: vi.fn().mockReturnValue(o.resolveLayersResult ?? [{ priority: 0, image: 'entity.png' }]),
  } as unknown as EntityInstance;
}

function makePlayer(layers: object[] = []): Player {
  return {
    skin: {
      resolveLayers: vi.fn().mockReturnValue(layers),
    },
  } as unknown as Player;
}

function makeField(opts?: {
  checkReachable?: (dest: { x: number; y: number }) => boolean;
  resolveLayersResult?: object[];
}): Field {
  const o = opts ?? {};
  return {
    checkReachable: vi.fn().mockImplementation(o.checkReachable ?? (() => true)),
    resolveLayers: vi.fn().mockReturnValue(o.resolveLayersResult ?? []),
  } as unknown as Field;
}

function makeInput(pressed: Partial<Record<string, boolean>> = {}): InputManager<any> {
  return {
    isPressed: vi.fn().mockImplementation((key: string) => pressed[key] ?? false),
    press: vi.fn(),
    release: vi.fn(),
  } as unknown as InputManager<any>;
}

function makeRenderer(): GameRenderer {
  return {
    registerImage: vi.fn(),
    render: vi.fn(),
  };
}

function buildEngine(opts?: {
  field?: Field;
  playerPos?: FieldPos;
  players?: Player[];
  entities?: Record<string, EntityInstance>;
  ctx?: GameContext;
}) {
  const ctx = opts?.ctx ?? makeCtx();
  const field = opts?.field ?? makeField();
  const playerPos = opts?.playerPos ?? makeFieldPos();
  const players = opts?.players ?? [];
  const entities = opts?.entities ?? {};
  const state: FieldState = {
    playerPos,
    players,
    actions: new Queue(),
    entities,
  };
  return { engine: new FieldEngine(ctx, field, state), ctx, field, playerPos, players, state };
}

// ─────────────────────────────────────────────────────────────────────────────
// ■ 移動ロジック (movePlayer)
// ─────────────────────────────────────────────────────────────────────────────

describe('移動ロジック (movePlayer)', () => {
  it('到達不能タイルには移動しない', () => {
    const field = makeField({ checkReachable: () => false });
    const playerPos = makeFieldPos({ current: { x: 1, y: 1 } });
    const { engine } = buildEngine({ field, playerPos });

    engine.movePlayer(NOW_MS, {
      command: 'walk',
      direction: 'right',
      async: true,
      force: false,
    });

    expect(playerPos.move).not.toHaveBeenCalled();
  });

  it('allowOverwrap=false のエンティティがいる位置には移動しない', () => {
    const destPos = { x: 2, y: 1 };
    const entityPos = makeFieldPos({ current: destPos, getDestinationResult: destPos });
    const entity = makeEntityInstance({ pos: entityPos, allowOverwrap: false });

    const field = makeField({ checkReachable: () => true });
    const playerPos = makeFieldPos({ current: { x: 1, y: 1 } });
    const { engine } = buildEngine({ field, playerPos, entities: { e1: entity } });

    engine.movePlayer(NOW_MS, {
      command: 'walk',
      direction: 'right',
      async: true,
      force: false,
    });

    expect(playerPos.move).not.toHaveBeenCalled();
  });

  it('allowOverwrap=true のエンティティがいる位置には移動できる', () => {
    const destPos = { x: 2, y: 1 };
    const entityPos = makeFieldPos({ current: destPos, getDestinationResult: destPos });
    const entity = makeEntityInstance({ pos: entityPos, allowOverwrap: true });

    const field = makeField({ checkReachable: () => true });
    const playerPos = makeFieldPos({ current: { x: 1, y: 1 } });
    const { engine } = buildEngine({ field, playerPos, entities: { e1: entity } });

    engine.movePlayer(NOW_MS, {
      command: 'walk',
      direction: 'right',
      async: true,
      force: false,
    });

    expect(playerPos.move).toHaveBeenCalledWith(NOW_MS, expect.objectContaining({ direction: 'right' }));
  });

  it('移動中 (currentMovement != null) は次の移動が発火しない', () => {
    const playerPos = makeFieldPos({
      current: { x: 1, y: 1 },
      currentMovement: { dest: { x: 2, y: 1 }, timeMsStart: 800, durationMs: 200 },
    });
    const field = makeField({ checkReachable: () => true });
    const { engine } = buildEngine({ field, playerPos });

    engine.movePlayer(NOW_MS, {
      command: 'walk',
      direction: 'right',
      async: true,
      force: false,
    });

    expect(playerPos.move).not.toHaveBeenCalled();
  });

  it('到達可能・移動中でない場合は move が呼ばれる', () => {
    const field = makeField({ checkReachable: () => true });
    const playerPos = makeFieldPos({ current: { x: 1, y: 1 } });
    const { engine } = buildEngine({ field, playerPos });

    engine.movePlayer(NOW_MS, {
      command: 'walk',
      direction: 'right',
      async: true,
      force: false,
    });

    expect(playerPos.move).toHaveBeenCalledWith(NOW_MS, expect.objectContaining({ direction: 'right' }));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ■ エンティティ移動 (moveEntity)
// ─────────────────────────────────────────────────────────────────────────────

describe('エンティティ移動 (moveEntity)', () => {
  it('プレイヤーの移動先と同じ座標には移動しない', () => {
    const destPos = { x: 2, y: 1 };
    const playerPos = makeFieldPos({ current: destPos, getDestinationResult: destPos });
    const entityPos = makeFieldPos({ current: { x: 1, y: 1 } });
    const entity = makeEntityInstance({ pos: entityPos });

    const field = makeField({ checkReachable: () => true });
    const { engine } = buildEngine({ field, playerPos, entities: { e1: entity } });

    engine.moveEntity(NOW_MS, 'e1', {
      command: 'walk',
      direction: 'right',
      async: true,
      force: false,
    });

    expect(entityPos.move).not.toHaveBeenCalled();
  });

  it('到達不能な場合は移動しない', () => {
    const playerPos = makeFieldPos({ current: { x: 5, y: 5 }, getDestinationResult: { x: 5, y: 5 } });
    const entityPos = makeFieldPos({ current: { x: 1, y: 1 } });
    const entity = makeEntityInstance({ pos: entityPos });

    const field = makeField({ checkReachable: () => false });
    const { engine } = buildEngine({ field, playerPos, entities: { e1: entity } });

    engine.moveEntity(NOW_MS, 'e1', {
      command: 'walk',
      direction: 'right',
      async: true,
      force: false,
    });

    expect(entityPos.move).not.toHaveBeenCalled();
  });

  it('到達可能かつプレイヤーと座標が被らない場合は move が呼ばれる', () => {
    const playerPos = makeFieldPos({ current: { x: 5, y: 5 }, getDestinationResult: { x: 5, y: 5 } });
    const entityPos = makeFieldPos({ current: { x: 1, y: 1 } });
    const entity = makeEntityInstance({ pos: entityPos });

    const field = makeField({ checkReachable: () => true });
    const { engine } = buildEngine({ field, playerPos, entities: { e1: entity } });

    engine.moveEntity(NOW_MS, 'e1', {
      command: 'walk',
      direction: 'right',
      async: true,
      force: false,
    });

    expect(entityPos.move).toHaveBeenCalledWith(NOW_MS, expect.objectContaining({ direction: 'right' }));
  });

  it('エンティティ移動中は次の移動が発火しない', () => {
    const playerPos = makeFieldPos({ current: { x: 5, y: 5 }, getDestinationResult: { x: 5, y: 5 } });
    const entityPos = makeFieldPos({
      current: { x: 1, y: 1 },
      currentMovement: { dest: { x: 2, y: 1 }, timeMsStart: 800, durationMs: 200 },
    });
    const entity = makeEntityInstance({ pos: entityPos });

    const field = makeField({ checkReachable: () => true });
    const { engine } = buildEngine({ field, playerPos, entities: { e1: entity } });

    engine.moveEntity(NOW_MS, 'e1', {
      command: 'walk',
      direction: 'right',
      async: true,
      force: false,
    });

    expect(entityPos.move).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ■ 入力処理 (resolveMove)
// ─────────────────────────────────────────────────────────────────────────────

describe('入力処理 (resolveMove)', () => {
  let engine: FieldEngine;

  beforeEach(() => {
    ({ engine } = buildEngine());
  });

  it('"left" キーが押された場合 "left" を返す', () => {
    const input = makeInput({ left: true });
    expect(engine.resolveMove(input)).toBe('left');
  });

  it('"right" キーが押された場合 "right" を返す', () => {
    const input = makeInput({ right: true });
    expect(engine.resolveMove(input)).toBe('right');
  });

  it('"up" キーが押された場合 "up" を返す', () => {
    const input = makeInput({ up: true });
    expect(engine.resolveMove(input)).toBe('up');
  });

  it('"down" キーが押された場合 "down" を返す', () => {
    const input = makeInput({ down: true });
    expect(engine.resolveMove(input)).toBe('down');
  });

  it('何も押されていない場合 null を返す', () => {
    const input = makeInput({});
    expect(engine.resolveMove(input)).toBeNull();
  });

  it('left と right が同時押しの場合 left が優先される', () => {
    const input = makeInput({ left: true, right: true });
    expect(engine.resolveMove(input)).toBe('left');
  });

  it('right と up が同時押しの場合 right が優先される', () => {
    const input = makeInput({ right: true, up: true });
    expect(engine.resolveMove(input)).toBe('right');
  });

  it('up と down が同時押しの場合 up が優先される', () => {
    const input = makeInput({ up: true, down: true });
    expect(engine.resolveMove(input)).toBe('up');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ■ tick 処理 (onTick)
// ─────────────────────────────────────────────────────────────────────────────

describe('tick 処理 (onTick)', () => {
  it('playerPos.tick が nowMs で呼ばれる', () => {
    const playerPos = makeFieldPos();
    const renderer = makeRenderer();
    const input = makeInput({});
    const { engine } = buildEngine({ playerPos });

    // NOTE: onTick 内で未定義変数 `viewport` が参照されるため ReferenceError が発生する。
    engine.onTick(input, NOW_MS, renderer);

    expect(playerPos.tick).toHaveBeenCalledWith(NOW_MS);
  });

  it('各エンティティの pos.tick が nowMs で呼ばれる', () => {
    const entityPos = makeFieldPos();
    const entity = makeEntityInstance({ pos: entityPos });
    const playerPos = makeFieldPos();
    const renderer = makeRenderer();
    const input = makeInput({});
    const { engine } = buildEngine({ playerPos, entities: { e1: entity } });

    // NOTE: 同様に onTick 内で viewport ReferenceError が発生する。
    engine.onTick(input, NOW_MS, renderer);

    expect(entityPos.tick).toHaveBeenCalledWith(NOW_MS);
  });

  it('renderer.render が呼ばれる', () => {
    const playerPos = makeFieldPos();
    const renderer = makeRenderer();
    const input = makeInput({});
    const { engine } = buildEngine({ playerPos });

    engine.onTick(input, NOW_MS, renderer);

    expect(renderer.render).toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ■ 描画 (resolveEntitiesLayers / resolvePlayerLayers / retrieveLayers)
// ─────────────────────────────────────────────────────────────────────────────

describe('描画 (resolveEntitiesLayers)', () => {
  it('visible=false のエンティティはレイヤーに含まれない', () => {
    const ctx = makeCtx();
    const entityPos = makeFieldPos({ getCurrentPixelResult: { x: 50, y: 50 } });
    const entity = makeEntityInstance({ pos: entityPos, visible: false });
    const viewport = new Rect(0, 0, 320, 240);

    const field = makeField();
    const playerPos = makeFieldPos();
    const state: FieldState = {
      playerPos,
      players: [],
      actions: new Queue(),
      entities: { e1: entity },
    };
    const engine = new FieldEngine(ctx, field, state);

    const layers = engine.resolveEntitiesLayers(NOW_MS, viewport);

    expect(layers).toHaveLength(0);
  });

  it('viewport 外のエンティティはレイヤーに含まれない', () => {
    const ctx = makeCtx();
    // viewport の完全外側 (右側)
    const viewport = new Rect(0, 0, 320, 240);
    const entityPos = makeFieldPos({ getCurrentPixelResult: { x: 400, y: 50 } });
    const entity = makeEntityInstance({ pos: entityPos, visible: true });

    const field = makeField();
    const playerPos = makeFieldPos();
    const state: FieldState = {
      playerPos,
      players: [],
      actions: new Queue(),
      entities: { e1: entity },
    };
    const engine = new FieldEngine(ctx, field, state);

    const layers = engine.resolveEntitiesLayers(NOW_MS, viewport);

    expect(layers).toHaveLength(0);
  });

  it('viewport 内のエンティティはレイヤーに含まれる', () => {
    const ctx = makeCtx();
    const viewport = new Rect(0, 0, 320, 240);
    // エンティティは viewport 内 (100, 100)
    const entityPos = makeFieldPos({ getCurrentPixelResult: { x: 100, y: 100 } });
    const layer = { priority: 0, image: 'entity.png' };
    const entity = makeEntityInstance({
      pos: entityPos,
      visible: true,
      resolveLayersResult: [layer],
    });

    const field = makeField();
    const playerPos = makeFieldPos();
    const state: FieldState = {
      playerPos,
      players: [],
      actions: new Queue(),
      entities: { e1: entity },
    };
    const engine = new FieldEngine(ctx, field, state);

    const layers = engine.resolveEntitiesLayers(NOW_MS, viewport);

    // NOTE: Rect.overwrap の Y 軸判定バグにより、この assert は失敗する。
    expect(layers).toHaveLength(1);
    expect(layers[0]).toMatchObject({ layer });
  });

  it('retrieveLayers のプレイヤー・エンティティ部分はフラットな {rect, layer}[] を返す', () => {
    const ctx = makeCtx();
    const viewport = new Rect(0, 0, 320, 240);

    const playerLayer = { priority: 0, image: 'player.png' };
    const player = makePlayer([playerLayer]);

    const entityLayer = { priority: 1, image: 'entity.png' };
    const entityPos = makeFieldPos({ getCurrentPixelResult: { x: 50, y: 50 } });
    const entity = makeEntityInstance({
      pos: entityPos,
      visible: true,
      resolveLayersResult: [entityLayer],
    });

    // タイルレイヤーは空配列を返すモックにして、プレイヤー/エンティティのみ検証する。
    // (field.resolveLayers は {rect, layers} 形式で返すため、
    //  retrieveLayers が混合形状を返すという別の設計問題があるが、ここでは対象外)
    const field = makeField({ resolveLayersResult: [] });
    const playerPos = makeFieldPos({ getCurrentPixelResult: { x: 32, y: 32 } });

    const state: FieldState = {
      playerPos,
      players: [player],
      actions: new Queue(),
      entities: { e1: entity },
    };
    const engine = new FieldEngine(ctx, field, state);

    const layers = engine.retrieveLayers(NOW_MS, viewport);

    // NOTE: resolvePlayerLayers が Array<Array<...>> を返す場合、
    //       先頭要素が配列になりこの assert は失敗する。
    // Bug 3 (flatMap 修正) 後は全要素が {rect, layer} になること。
    layers.forEach((item) => {
      expect(Array.isArray(item)).toBe(false);
      expect(item).toHaveProperty('rect');
      expect(item).toHaveProperty('layer');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ■ viewport (calcViewPort)
// ─────────────────────────────────────────────────────────────────────────────

describe('viewport (calcViewPort)', () => {
  it('プレイヤータイルの中心が viewport の中心になる', () => {
    // プレイヤーのピクセル左上が (64, 96)、ブロックサイズ 32x32
    // タイル中心 = (64 + 16, 96 + 16) = (80, 112)
    // 期待 viewport = Rect(80 - 160, 112 - 120, 320, 240) = Rect(-80, -8, 320, 240)
    const playerPos = makeFieldPos({ getCurrentPixelResult: { x: 64, y: 96 } });
    const { engine } = buildEngine({ playerPos });

    const viewport = engine.calcViewPort(NOW_MS);

    // NOTE: 現在の実装は (px + bw) / 2 で計算するため px=64, bw=32 → 48, 正解は 80。
    //       この assert は失敗する。
    expect(viewport.left).toBe(80 - 160); // -80
    expect(viewport.top).toBe(112 - 120); // -8
  });

  it('viewport の width/height は screen サイズと一致する', () => {
    const ctx = makeCtx({ screen: { width: 480, height: 320 } });
    const playerPos = makeFieldPos({ getCurrentPixelResult: { x: 0, y: 0 } });
    const { engine } = buildEngine({ playerPos, ctx });

    const viewport = engine.calcViewPort(NOW_MS);

    expect(viewport.width).toBe(480);
    expect(viewport.height).toBe(320);
  });
});
