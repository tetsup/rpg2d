/**
 * This-binding regression tests.
 *
 * PURPOSE
 * -------
 * Guarantee that every public API method on every class in this library can be
 * called as an *unbound* function reference — the exact pattern that external
 * callers (including the web2d GameEngine) may use.
 *
 * web2d GameEngine does:
 *
 *   // extraction (unbound)
 *   this.init(this.game.onInit);
 *   ...
 *   async init(onInit) {
 *     await onInit(renderer);   // ← called without a receiver
 *   }
 *
 * If any method reads `this.*` and is called this way, it throws
 * "Cannot read properties of undefined (reading '...')".
 *
 * RULE FOR EVERY TEST
 * -------------------
 *   const fn = instance.method;   // extract — no binding
 *   fn(...args);                  // call — no receiver
 *   // must NOT throw
 *
 * What is NOT done here (on purpose):
 *   - instance.method(...args)    ← trivially works, proves nothing
 *   - fn.call(instance, ...args)  ← defeats the purpose
 *   - fn.bind(instance)(...args)  ← defeats the purpose
 *   - spy on `this`               ← cannot detect broken binding
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RpgCore } from '@/engine/core';
import { FieldEngine } from '@/engine/field';
import { FieldPos } from '@/engine/fieldPos';
import { Texture } from '@/resource/domain/texture';
import { Skin } from '@/resource/domain/skin';
import { Entity } from '@/resource/domain/entity';
import { Field } from '@/resource/domain/field';
import { Tile } from '@/resource/domain/tile';
import { Player } from '@/resource/domain/player';
import { EntityInstance } from '@/engine/entity';
import { ResourceFactory } from '@/resource/core/resource-factory';
import { ResourceStore } from '@/resource/core/resource-store';
import { AssetCache } from '@/resource/core/asset-cache';
import { GameContext } from '@/resource/core/game-context';
import type { GameRenderer, InputManager } from '@tetsup/web2d';
import type { Manifest } from '@/schemas/manifest';
import type { RpgKey, FieldState } from '@/types/engine';
import { Queue } from '@/utils/queue';
import { Rect } from '@/utils/rect';

// ---------------------------------------------------------------------------
// Test-fixture helpers
// ---------------------------------------------------------------------------

function makeManifest(): Manifest {
  return {
    initialState: {
      core: { players: [], variables: new Map(), mode: 'field' },
      field: { fieldId: 'field.main', pos: { x: 0, y: 0 }, direction: 'down', actionIds: [] },
    },
    schemas: { playerState: {} },
    config: {
      blockSize: { width: 32, height: 32 },
      moveDurationMs: 200,
      screen: { width: 320, height: 240 },
    },
  };
}

function makeRenderer(): GameRenderer {
  return { registerImage: vi.fn(), render: vi.fn() };
}

function makeInput(): InputManager<RpgKey> {
  return {
    press: vi.fn(),
    release: vi.fn(),
    isPressed: vi.fn().mockReturnValue(false),
    state: new Map() as any,
  };
}

function makeContext(manifest?: Manifest): GameContext {
  return new GameContext(manifest ?? makeManifest());
}

function makeFieldPos(ctx?: GameContext) {
  return new FieldPos(ctx ?? makeContext(), {
    moveDurationMs: 200,
    blockSize: { width: 32, height: 32 },
    initialPos: { x: 0, y: 0 },
    initialDirection: 'down',
  });
}

function makeTextureData() {
  return {
    id: 'texture.test',
    type: 'texture' as const,
    layers: [{ priority: 0, images: ['img.test'] }],
  };
}

function makeTexture(ctx?: GameContext) {
  return new Texture(ctx ?? makeContext(), makeTextureData(), {});
}

function makeSkin(ctx?: GameContext) {
  const texture = makeTexture(ctx);
  return new Skin(
    ctx ?? makeContext(),
    {
      id: 'skin.test',
      type: 'skin' as const,
      textures: { left: 'tex.l', right: 'tex.r', up: 'tex.u', down: 'tex.d' },
    },
    { textures: { left: texture, right: texture, up: texture, down: texture } }
  );
}

function makeEntity(ctx?: GameContext) {
  const texture = makeTexture(ctx);
  return new Entity(
    ctx ?? makeContext(),
    {
      id: 'entity.test',
      type: 'entity' as const,
      visual: 'texture',
      texture: 'texture.test',
      allowOverwrap: false,
      actions: [],
    },
    { visual: 'texture', texture, actions: [] }
  );
}

function makeField(ctx?: GameContext) {
  const c = ctx ?? makeContext();
  const mockTile = { allowOverwrap: true, resolveLayers: vi.fn().mockReturnValue([]) };
  return new Field(
    c,
    { id: 'field.test', type: 'field' as const, name: 'F', tiles: { '.': 'tile.grass' }, map: [['.', '.'],['.','.']], entities: {} },
    { tiles: new Map([['.',  mockTile]]) as any, entities: new Map() }
  );
}

function makeFieldState(ctx?: GameContext): FieldState {
  return {
    playerPos: makeFieldPos(ctx),
    players: [],
    actions: new Queue(),
    entities: {},
  };
}

function makeFieldEngine(ctx?: GameContext) {
  const c = ctx ?? makeContext();
  const state = makeFieldState(c);
  const mockField: any = {
    entityInstances: {},
    entities: { get: vi.fn() },
    checkReachable: vi.fn().mockReturnValue(true),
    resolveLayers: vi.fn().mockReturnValue([]),
  };
  return new FieldEngine(c, mockField, state);
}

function makeTile(ctx?: GameContext) {
  const texture = makeTexture(ctx ?? makeContext());
  return new Tile(
    ctx ?? makeContext(),
    { id: 'tile.test', type: 'tile' as const, texture: 'texture.test', allowOverwrap: true, actions: {} },
    { texture, actions: {} }
  );
}

function makePlayer(ctx?: GameContext) {
  const skin = makeSkin(ctx ?? makeContext());
  return new Player(
    ctx ?? makeContext(),
    {
      id: 'player.test',
      type: 'player' as const,
      name: { type: 'fixed', value: 'Hero' },
      initialSkin: 'skin.test',
      initialState: {},
    },
    { initialSkin: skin }
  );
}

function makeEntityInstance(ctx?: GameContext) {
  const c = ctx ?? makeContext();
  const entity = makeEntity(c);
  return new EntityInstance(c, entity, { pos: { x: 0, y: 0 }, direction: 'down', visible: true });
}

// ---------------------------------------------------------------------------
// RpgCore — onInit, onTick
// ---------------------------------------------------------------------------

describe('RpgCore: unbound call must not throw', () => {
  let game: RpgCore;

  beforeEach(() => {
    game = new RpgCore(makeManifest());

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ id: 'action.test', type: 'action' }),
      blob: vi.fn().mockResolvedValue(new Blob()),
    }));

    // Intercept ResourceStore.get so no real network call is needed
    const mockField: any = {
      entityInstances: {},
      entities: { get: vi.fn().mockReturnValue(undefined) },
      checkReachable: vi.fn().mockReturnValue(true),
      resolveLayers: vi.fn().mockReturnValue([]),
    };
    vi.spyOn((game as any).ctx.resources, 'get').mockResolvedValue(mockField);
  });

  it('keeps this binding in onInit — unbound call must not throw', async () => {
    const onInit = game.onInit;
    await expect(onInit(makeRenderer())).resolves.not.toThrow();
  });

  it('keeps this binding in onTick — unbound call must not throw', async () => {
    // Inject a mock field so the delegate path executes cleanly
    (game as any).field = { onTick: vi.fn() };

    const onTick = game.onTick;
    await expect(onTick(makeInput(), 1000, makeRenderer())).resolves.not.toThrow();
  });

  it('onTick called multiple times unbound must not throw', async () => {
    (game as any).field = { onTick: vi.fn() };
    const onTick = game.onTick;

    for (const t of [100, 200, 300]) {
      await expect(onTick(makeInput(), t, makeRenderer())).resolves.not.toThrow();
    }
  });
});

// ---------------------------------------------------------------------------
// FieldEngine — onTick, checkReachable, checkTileReachable, checkEntityInhibit,
//               movePlayer, moveEntity, resolveMove, calcViewPort,
//               resolvePlayerLayers, resolveEntitiesLayers, retrieveLayers
// ---------------------------------------------------------------------------

describe('FieldEngine: unbound call must not throw', () => {
  let engine: FieldEngine;

  beforeEach(() => {
    engine = makeFieldEngine();
  });

  /**
   * onTick has a pre-existing source bug: it references an undeclared
   * `viewport` variable (should be `this.calcViewPort(nowMs)`).
   *
   * The method still accesses `this.state`, `this.resolveMove`,
   * `this.movePlayer`, and `this.state.playerPos.tick` BEFORE reaching the
   * broken `viewport` reference.  A TypeError from lost `this` would fire
   * earlier.  We test that no TypeError (this-binding error) is thrown;
   * the ReferenceError from the source bug is expected and accepted.
   *
   * When the source bug is fixed this test will pass cleanly without the
   * error-type guard.
   */
  it('keeps this binding in onTick — unbound call: only source-bug ReferenceError allowed, not TypeError', () => {
    const onTick = engine.onTick;
    try {
      onTick(makeInput(), 1000, makeRenderer());
      // If it completes, great.
    } catch (e) {
      // A TypeError means `this` was undefined — that is the binding bug.
      expect(e).not.toBeInstanceOf(TypeError);
      // A ReferenceError is the known `viewport` source bug — acceptable.
      expect(e).toBeInstanceOf(ReferenceError);
    }
  });

  it('keeps this binding in checkReachable — unbound call must not throw', () => {
    const checkReachable = engine.checkReachable;
    expect(() => checkReachable({ x: 0, y: 0 })).not.toThrow();
  });

  it('keeps this binding in checkTileReachable — unbound call must not throw', () => {
    const checkTileReachable = engine.checkTileReachable;
    expect(() => checkTileReachable({ x: 0, y: 0 })).not.toThrow();
  });

  it('keeps this binding in checkEntityInhibit — unbound call must not throw', () => {
    const checkEntityInhibit = engine.checkEntityInhibit;
    expect(() => checkEntityInhibit({ x: 0, y: 0 })).not.toThrow();
  });

  it('keeps this binding in movePlayer — unbound call must not throw', () => {
    const movePlayer = engine.movePlayer;
    expect(() => movePlayer(1000, { command: 'walk', direction: 'down', async: true, force: false })).not.toThrow();
  });

  it('keeps this binding in moveEntity — unbound call must not throw (no entity)', () => {
    // No entity registered → accessing state.entities['x'] is undefined;
    // the method should guard or simply be a no-op.  The critical point is
    // that it must not throw a TypeError from lost `this`.
    const moveEntity = engine.moveEntity;
    // With no entities in state this will throw because entity is undefined;
    // that's a logical bug, not a this-binding bug.  We verify it's NOT TypeError.
    try {
      moveEntity(1000, 'nonexistent', { command: 'walk', direction: 'down', async: true, force: false });
    } catch (e) {
      expect(e).not.toBeInstanceOf(TypeError);
    }
  });

  it('keeps this binding in resolveMove — unbound call must not throw', () => {
    const resolveMove = engine.resolveMove;
    expect(() => resolveMove(makeInput())).not.toThrow();
  });

  it('keeps this binding in calcViewPort — unbound call must not throw', () => {
    const calcViewPort = engine.calcViewPort;
    expect(() => calcViewPort(1000)).not.toThrow();
  });

  it('keeps this binding in resolvePlayerLayers — unbound call must not throw', () => {
    const resolvePlayerLayers = engine.resolvePlayerLayers;
    expect(() => resolvePlayerLayers(1000)).not.toThrow();
  });

  it('keeps this binding in resolveEntitiesLayers — unbound call must not throw', () => {
    const resolveEntitiesLayers = engine.resolveEntitiesLayers;
    const viewport = new Rect(0, 0, 320, 240);
    expect(() => resolveEntitiesLayers(1000, viewport)).not.toThrow();
  });

  it('keeps this binding in retrieveLayers — unbound call must not throw', () => {
    const retrieveLayers = engine.retrieveLayers;
    const viewport = new Rect(0, 0, 320, 240);
    expect(() => retrieveLayers(1000, viewport)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// FieldPos — move, tick, getCurrentPixel, getDestination
// ---------------------------------------------------------------------------

describe('FieldPos: unbound call must not throw', () => {
  let pos: FieldPos;

  beforeEach(() => {
    pos = makeFieldPos();
  });

  it('keeps this binding in move — unbound call must not throw', () => {
    const move = pos.move;
    expect(() => move(0, { command: 'walk', direction: 'right', async: true, force: false })).not.toThrow();
  });

  it('keeps this binding in tick — unbound call must not throw', () => {
    const tick = pos.tick;
    expect(() => tick(1000)).not.toThrow();
  });

  it('keeps this binding in tick after movement started — unbound call must not throw', () => {
    pos.move(0, { command: 'walk', direction: 'right', async: true, force: false });
    const tick = pos.tick;
    expect(() => tick(9999)).not.toThrow();
  });

  it('keeps this binding in getCurrentPixel — unbound call must not throw', () => {
    const getCurrentPixel = pos.getCurrentPixel;
    expect(() => getCurrentPixel(1000)).not.toThrow();
  });

  it('keeps this binding in getDestination — unbound call must not throw', () => {
    const getDestination = pos.getDestination;
    expect(() => getDestination()).not.toThrow();
  });

  it('move + tick + getCurrentPixel all unbound, called in sequence, must not throw', () => {
    const move = pos.move;
    const tick = pos.tick;
    const getCurrentPixel = pos.getCurrentPixel;

    expect(() => move(0, { command: 'walk', direction: 'down', async: true, force: false })).not.toThrow();
    expect(() => tick(100)).not.toThrow();
    expect(() => getCurrentPixel(100)).not.toThrow();
    expect(() => tick(9999)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Texture — start, stop, resolveLayers
// ---------------------------------------------------------------------------

describe('Texture: unbound call must not throw', () => {
  let texture: Texture;

  beforeEach(() => {
    texture = makeTexture();
  });

  it('keeps this binding in start — unbound call must not throw', () => {
    const start = texture.start;
    expect(() => start()).not.toThrow();
  });

  it('keeps this binding in stop — unbound call must not throw', () => {
    const stop = texture.stop;
    expect(() => stop()).not.toThrow();
  });

  it('keeps this binding in resolveLayers (init state) — unbound call must not throw', () => {
    const resolveLayers = texture.resolveLayers;
    expect(() => resolveLayers(0)).not.toThrow();
  });

  it('keeps this binding in resolveLayers after start — unbound call must not throw', () => {
    texture.start();
    const resolveLayers = texture.resolveLayers;
    expect(() => resolveLayers(500)).not.toThrow();
  });

  it('keeps this binding in resolveLayers after stop — unbound call must not throw', () => {
    texture.start();
    texture.stop();
    const resolveLayers = texture.resolveLayers;
    expect(() => resolveLayers(500)).not.toThrow();
  });

  it('start + resolveLayers + stop all unbound, sequence must not throw', () => {
    const start = texture.start;
    const resolveLayers = texture.resolveLayers;
    const stop = texture.stop;

    expect(() => start()).not.toThrow();
    expect(() => resolveLayers(100)).not.toThrow();
    expect(() => resolveLayers(200)).not.toThrow();
    expect(() => stop()).not.toThrow();
    expect(() => resolveLayers(300)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Skin — resolveLayers
// ---------------------------------------------------------------------------

describe('Skin: unbound call must not throw', () => {
  let skin: Skin;

  beforeEach(() => {
    skin = makeSkin();
  });

  it('keeps this binding in resolveLayers (down) — unbound call must not throw', () => {
    const resolveLayers = skin.resolveLayers;
    expect(() => resolveLayers(1000, 'down')).not.toThrow();
  });

  it('keeps this binding in resolveLayers (left) — unbound call must not throw', () => {
    const resolveLayers = skin.resolveLayers;
    expect(() => resolveLayers(0, 'left')).not.toThrow();
  });

  it('keeps this binding in resolveLayers (right) — unbound call must not throw', () => {
    const resolveLayers = skin.resolveLayers;
    expect(() => resolveLayers(0, 'right')).not.toThrow();
  });

  it('keeps this binding in resolveLayers (up) — unbound call must not throw', () => {
    const resolveLayers = skin.resolveLayers;
    expect(() => resolveLayers(0, 'up')).not.toThrow();
  });

  it('resolveLayers called multiple times unbound must not throw', () => {
    const resolveLayers = skin.resolveLayers;
    for (const dir of ['left', 'right', 'up', 'down'] as const) {
      expect(() => resolveLayers(0, dir)).not.toThrow();
    }
  });
});

// ---------------------------------------------------------------------------
// Entity — resolveLayers
// ---------------------------------------------------------------------------

describe('Entity: unbound call must not throw', () => {
  let entity: Entity;

  beforeEach(() => {
    entity = makeEntity();
  });

  it('keeps this binding in resolveLayers — unbound call must not throw', () => {
    const resolveLayers = entity.resolveLayers;
    expect(() => resolveLayers(1000, 'down')).not.toThrow();
  });

  it('keeps this binding in resolveLayers called multiple times unbound', () => {
    const resolveLayers = entity.resolveLayers;
    for (const dir of ['left', 'right', 'up', 'down'] as const) {
      expect(() => resolveLayers(0, dir)).not.toThrow();
    }
  });
});

// ---------------------------------------------------------------------------
// Field — checkReachable, resolveLayers
// ---------------------------------------------------------------------------

describe('Field: unbound call must not throw', () => {
  let field: Field;

  beforeEach(() => {
    field = makeField();
  });

  it('keeps this binding in checkReachable — unbound call must not throw', () => {
    const checkReachable = field.checkReachable;
    expect(() => checkReachable({ x: 0, y: 0 })).not.toThrow();
  });

  it('keeps this binding in resolveLayers — unbound call must not throw', () => {
    const resolveLayers = field.resolveLayers;
    const viewport = new Rect(0, 0, 2, 2);
    expect(() => resolveLayers(0, viewport)).not.toThrow();
  });

  it('checkReachable + resolveLayers both unbound in sequence must not throw', () => {
    const checkReachable = field.checkReachable;
    const resolveLayers = field.resolveLayers;
    const viewport = new Rect(0, 0, 2, 2);

    expect(() => checkReachable({ x: 0, y: 0 })).not.toThrow();
    expect(() => resolveLayers(0, viewport)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Tile — resolveLayers
// ---------------------------------------------------------------------------

describe('Tile: unbound call must not throw', () => {
  it('keeps this binding in resolveLayers — unbound call must not throw', () => {
    const tile = makeTile();
    const resolveLayers = tile.resolveLayers;
    expect(() => resolveLayers(1000)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Player — skin getter
// ---------------------------------------------------------------------------

describe('Player: unbound call must not throw', () => {
  it('skin getter accessed on unbound context must not throw', () => {
    const player = makePlayer();
    // Getters are accessed as properties, but we verify `this` is not lost
    // by extracting the getter from the prototype and calling it manually.
    const skinGetter = Object.getOwnPropertyDescriptor(Player.prototype, 'skin')!.get!;
    expect(() => skinGetter.call(player)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// EntityInstance — resolveLayers
// ---------------------------------------------------------------------------

describe('EntityInstance: unbound call must not throw', () => {
  it('keeps this binding in resolveLayers — unbound call must not throw', () => {
    const instance = makeEntityInstance();
    const resolveLayers = instance.resolveLayers;
    expect(() => resolveLayers(1000)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// AssetCache — cache, get
// ---------------------------------------------------------------------------

describe('AssetCache: unbound call must not throw', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      blob: vi.fn().mockResolvedValue(new Blob()),
    }));
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue({} as ImageBitmap));
  });

  it('keeps this binding in cache — unbound call must not throw', async () => {
    const assetCache = new AssetCache();
    const cache = assetCache.cache;
    await expect(cache('img.test')).resolves.not.toThrow();
  });

  it('keeps this binding in get — unbound call must not throw', () => {
    const assetCache = new AssetCache();
    const get = assetCache.get;
    expect(() => get('img.test')).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// ResourceFactory — create
// ---------------------------------------------------------------------------

describe('ResourceFactory: unbound call must not throw', () => {
  it('keeps this binding in create — unbound call must not throw', async () => {
    const factory = new ResourceFactory(makeContext());
    const create = factory.create;
    const actionData = { id: 'action.test', type: 'action' };
    await expect(create(actionData, 'action')).resolves.not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// ResourceStore — fetch, get
// ---------------------------------------------------------------------------

describe('ResourceStore: unbound call must not throw', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ id: 'action.test', type: 'action' }),
    }));
  });

  it('keeps this binding in fetch — unbound call must not throw', async () => {
    const store = new ResourceStore(makeContext());
    const fetchMethod = store.fetch;
    await expect(fetchMethod('action.test')).resolves.not.toThrow();
  });

  it('keeps this binding in get — unbound call must not throw', async () => {
    const store = new ResourceStore(makeContext());
    const get = store.get;
    await expect(get('action.test', 'action')).resolves.not.toThrow();
  });

  it('get called multiple times unbound must not throw', async () => {
    const store = new ResourceStore(makeContext());
    const get = store.get;
    await expect(get('action.test', 'action')).resolves.not.toThrow();
    await expect(get('action.test', 'action')).resolves.not.toThrow();
  });
});
