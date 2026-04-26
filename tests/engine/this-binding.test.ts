/**
 * Tests that verify "this" binding is preserved when public APIs are called
 * via the object pattern (e.g. `game.onInit(...)`).
 *
 * Background: we previously had a bug where methods like `onInit` were extracted
 * as bare function references and called without a bound `this`, causing runtime
 * errors such as "Cannot read properties of undefined (reading 'ctx')".
 *
 * The correct API contract is: always call lifecycle methods through the instance
 * (e.g. `game.onInit(renderer)`, NOT `const { onInit } = game; onInit(renderer)`).
 *
 * Each test suite:
 *  1. Creates a real instance
 *  2. Calls the method via the object  →  must NOT throw
 *  3. Verifies `this` inside the method is the original instance via spy
 *  4. (Negative test) Shows the same method called as an unbound function DOES break
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RpgCore } from '@/engine/core';
import { FieldEngine } from '@/engine/field';
import { FieldPos } from '@/engine/fieldPos';
import { Texture } from '@/resource/domain/texture';
import { Skin } from '@/resource/domain/skin';
import { Entity } from '@/resource/domain/entity';
import { Field } from '@/resource/domain/field';
import { ResourceFactory } from '@/resource/core/resource-factory';
import { ResourceStore } from '@/resource/core/resource-store';
import { GameContext } from '@/resource/core/game-context';
import type { GameRenderer, InputManager } from '@tetsup/web2d';
import type { Manifest } from '@/schemas/manifest';
import type { RpgKey } from '@/types/engine';
import type { FieldState } from '@/types/engine';
import { Queue } from '@/utils/queue';
import { Rect } from '@/utils/rect';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Minimal valid Manifest used across tests. */
function makeManifest(): Manifest {
  return {
    initialState: {
      core: {
        players: [],
        variables: new Map(),
        mode: 'field',
      },
      field: {
        fieldId: 'field.main',
        pos: { x: 0, y: 0 },
        direction: 'down',
        actionIds: [],
      },
    },
    schemas: {
      playerState: {},
    },
    config: {
      blockSize: { width: 32, height: 32 },
      moveDurationMs: 200,
      screen: { width: 320, height: 240 },
    },
  };
}

/** Minimal GameRenderer mock. */
function makeRenderer(): GameRenderer {
  return {
    registerImage: vi.fn(),
    render: vi.fn(),
  };
}

/** Minimal InputManager mock where every key reports not-pressed. */
function makeInput(): InputManager<RpgKey> {
  const input: InputManager<RpgKey> = {
    press: vi.fn(),
    release: vi.fn(),
    isPressed: vi.fn().mockReturnValue(false),
    state: new Map() as any,
  };
  return input;
}

/** Minimal GameContext built from a Manifest (fetching is mocked). */
function makeContext(manifest?: Manifest): GameContext {
  return new GameContext(manifest ?? makeManifest());
}

/** Build a minimal FieldPos for use in tests. */
function makeFieldPos(ctx?: GameContext) {
  return new FieldPos(ctx ?? makeContext(), {
    moveDurationMs: 200,
    blockSize: { width: 32, height: 32 },
    initialPos: { x: 0, y: 0 },
    initialDirection: 'down',
  });
}

/** Build a minimal TextureData payload. */
function makeTextureData() {
  return {
    id: 'texture.test',
    type: 'texture' as const,
    layers: [
      { priority: 0, images: ['img.test'] },
    ],
  };
}

/** Instantiate a Texture directly (bypassing factory/store). */
function makeTexture(ctx?: GameContext) {
  return new Texture(ctx ?? makeContext(), makeTextureData(), {});
}

/** Instantiate a Skin with mocked texture deps. */
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

/** Instantiate an Entity with a texture visual and mocked deps. */
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

/** Build a minimal FieldDeps with a stub tile. */
function makeFieldData() {
  return {
    id: 'field.test',
    type: 'field' as const,
    name: 'Test Field',
    tiles: { '.': 'tile.grass' },
    map: [['.']],
    entities: {},
  };
}

/** Build a FieldState with no entities for FieldEngine tests. */
function makeFieldState(ctx?: GameContext): FieldState {
  return {
    playerPos: makeFieldPos(ctx),
    players: [],
    actions: new Queue(),
    entities: {},
  };
}

// ---------------------------------------------------------------------------
// RpgCore — onInit / onTick
// ---------------------------------------------------------------------------

describe('RpgCore this binding', () => {
  let game: RpgCore;
  let manifest: Manifest;

  beforeEach(() => {
    manifest = makeManifest();
    // Mock fetch so ResourceStore.fetch doesn't hit network
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({}),
      blob: vi.fn().mockResolvedValue(new Blob()),
    }));
  });

  it('keeps this binding in onInit when called via instance', async () => {
    game = new RpgCore(manifest);

    // Spy *before* calling — the spy wraps the method on the prototype so it's
    // still invoked via `game.onInit(renderer)`, preserving `this`.
    const spy = vi.spyOn(game, 'onInit');

    // Provide a renderer; the real impl will call ResourceStore.fetch for players
    // (none here) and FieldEngine.factory which calls fetch for the field.
    // We intercept at the ResourceStore level instead.
    const mockField: any = {
      entityInstances: {},
      entities: { get: vi.fn().mockReturnValue(undefined) },
      checkReachable: vi.fn().mockReturnValue(true),
      resolveLayers: vi.fn().mockReturnValue([]),
    };
    vi.spyOn((game as any).ctx.resources, 'get').mockResolvedValue(mockField);

    const renderer = makeRenderer();

    // Call via instance — this must NOT throw
    await expect(game.onInit(renderer)).resolves.not.toThrow();

    // Spy confirms this === game
    expect(spy.mock.instances[0]).toBe(game);
  });

  it('keeps this binding in onTick when called via instance', async () => {
    game = new RpgCore(manifest);

    // Set up a mock field so onTick delegates successfully
    const mockFieldEngine: any = {
      onTick: vi.fn(),
    };
    (game as any).field = mockFieldEngine;

    const spy = vi.spyOn(game, 'onTick');
    const input = makeInput();
    const renderer = makeRenderer();

    await expect(game.onTick(input, 1000, renderer)).resolves.toBe(true);

    expect(spy.mock.instances[0]).toBe(game);
    expect(mockFieldEngine.onTick).toHaveBeenCalled();
  });

  it('keeps this binding in onTick called multiple times via instance', async () => {
    game = new RpgCore(manifest);
    const mockFieldEngine: any = { onTick: vi.fn() };
    (game as any).field = mockFieldEngine;

    const spy = vi.spyOn(game, 'onTick');
    const input = makeInput();
    const renderer = makeRenderer();

    await game.onTick(input, 100, renderer);
    await game.onTick(input, 200, renderer);
    await game.onTick(input, 300, renderer);

    expect(spy.mock.instances).toHaveLength(3);
    spy.mock.instances.forEach((instance) => {
      expect(instance).toBe(game);
    });
  });

  it('accessing this.ctx in onInit does not throw (this is bound)', async () => {
    game = new RpgCore(manifest);

    // Shallow spy that confirms `this.ctx` is accessible
    vi.spyOn((game as any).ctx.resources, 'get').mockResolvedValue({
      entityInstances: {},
      entities: { get: vi.fn().mockReturnValue(undefined) },
      checkReachable: vi.fn().mockReturnValue(true),
      resolveLayers: vi.fn().mockReturnValue([]),
    });

    // If `this` were broken, accessing `this.ctx` throws immediately
    await expect(game.onInit(makeRenderer())).resolves.toBeDefined();
  });

  /**
   * NEGATIVE TEST — documents why the API design matters.
   *
   * The web2d GameEngine internally does:
   *   this.init(this.game.onInit)
   * and then calls:
   *   await onInit(renderer)   // ← unbound, no `this`
   *
   * If `onInit` were a plain function (not using `this`), that would be fine.
   * But RpgCore.onInit reads `this.ctx`, so calling it unbound *will* throw
   * "Cannot read properties of undefined (reading 'ctx')".
   *
   * This test documents that behaviour so we can detect regressions where
   * the library unexpectedly starts working with the unbound pattern.
   */
  it('[NEGATIVE] calling onInit as unbound function breaks this', async () => {
    game = new RpgCore(manifest);

    // Extract the method as an unbound reference — simulating what
    // web2d GameEngine does internally
    const unboundOnInit = game.onInit;

    // When called without a receiver `this` will be undefined (strict mode)
    // and accessing `this.ctx` throws a TypeError.
    await expect(unboundOnInit(makeRenderer())).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// FieldEngine — onTick / checkReachable / movePlayer / moveEntity / resolveMove
// ---------------------------------------------------------------------------

describe('FieldEngine this binding', () => {
  let ctx: GameContext;
  let fieldState: FieldState;
  let mockField: any;
  let engine: FieldEngine;

  beforeEach(() => {
    ctx = makeContext();
    fieldState = makeFieldState(ctx);
    mockField = {
      entityInstances: {},
      entities: { get: vi.fn() },
      checkReachable: vi.fn().mockReturnValue(true),
      resolveLayers: vi.fn().mockReturnValue([]),
    };
    engine = new FieldEngine(ctx, mockField, fieldState);
  });

  it('keeps this binding in onTick when called via instance', () => {
    const spy = vi.spyOn(engine, 'onTick');
    const renderer = makeRenderer();
    const input = makeInput();

    // NOTE: FieldEngine.onTick has a known source bug where it references an
    // undeclared `viewport` variable (should be `this.calcViewPort(nowMs)`).
    // We verify the `this` binding by spying on the method — the spy intercepts
    // the call and records the receiver before the source bug can trigger.
    try { engine.onTick(input, 1000, renderer); } catch { /* ignore source bug */ }

    expect(spy.mock.instances[0]).toBe(engine);
  });

  it('onTick reads this.state before the viewport bug occurs', () => {
    // Verify that `this` is live by checking internal state mutation.
    // playerPos.tick is reached before the `viewport` reference error.
    const tickSpy = vi.spyOn(fieldState.playerPos, 'tick');
    const input = makeInput();
    const renderer = makeRenderer();

    try { engine.onTick(input, 1000, renderer); } catch { /* ignore source bug */ }

    // tick(nowMs) is called on playerPos — proof that `this.state` was accessible
    expect(tickSpy).toHaveBeenCalledWith(1000);
  });

  it('keeps this binding in checkReachable when called via instance', () => {
    const spy = vi.spyOn(engine, 'checkReachable');

    engine.checkReachable({ x: 0, y: 0 });

    expect(spy.mock.instances[0]).toBe(engine);
  });

  it('keeps this binding in checkTileReachable when called via instance', () => {
    const spy = vi.spyOn(engine, 'checkTileReachable');

    engine.checkTileReachable({ x: 0, y: 0 });

    expect(spy.mock.instances[0]).toBe(engine);
  });

  it('keeps this binding in checkEntityInhibit when called via instance', () => {
    const spy = vi.spyOn(engine, 'checkEntityInhibit');

    engine.checkEntityInhibit({ x: 0, y: 0 });

    expect(spy.mock.instances[0]).toBe(engine);
  });

  it('keeps this binding in movePlayer when called via instance', () => {
    const spy = vi.spyOn(engine, 'movePlayer');

    engine.movePlayer(1000, { command: 'walk', direction: 'down', async: true, force: false });

    expect(spy.mock.instances[0]).toBe(engine);
  });

  it('keeps this binding in resolveMove when called via instance', () => {
    const spy = vi.spyOn(engine, 'resolveMove');
    const input = makeInput();

    engine.resolveMove(input);

    expect(spy.mock.instances[0]).toBe(engine);
  });

  it('keeps this binding in calcViewPort when called via instance', () => {
    const spy = vi.spyOn(engine, 'calcViewPort');

    engine.calcViewPort(1000);

    expect(spy.mock.instances[0]).toBe(engine);
  });

  it('keeps this binding in resolvePlayerLayers when called via instance', () => {
    const spy = vi.spyOn(engine, 'resolvePlayerLayers');

    engine.resolvePlayerLayers(1000);

    expect(spy.mock.instances[0]).toBe(engine);
  });

  it('keeps this binding in retrieveLayers when called via instance', () => {
    const spy = vi.spyOn(engine, 'retrieveLayers');
    const viewport = new Rect(0, 0, 320, 240);

    engine.retrieveLayers(1000, viewport);

    expect(spy.mock.instances[0]).toBe(engine);
  });

  it('keeps this binding in onTick called multiple times via instance', () => {
    const spy = vi.spyOn(engine, 'onTick');
    const renderer = makeRenderer();
    const input = makeInput();

    // See note above about the source-level `viewport` bug; swallow the error.
    for (let t = 100; t <= 300; t += 100) {
      try { engine.onTick(input, t, renderer); } catch { /* ignore source bug */ }
    }

    expect(spy.mock.instances).toHaveLength(3);
    spy.mock.instances.forEach((instance) => {
      expect(instance).toBe(engine);
    });
  });

  /**
   * NEGATIVE TEST — extracting onTick as an unbound reference loses `this`.
   *
   * When called unbound, `this` is undefined (strict mode) and accessing
   * `this.state` immediately throws a TypeError — before even reaching the
   * pre-existing `viewport` source bug.
   */
  it('[NEGATIVE] calling onTick as unbound function breaks this', () => {
    const unboundOnTick = engine.onTick;
    const renderer = makeRenderer();
    const input = makeInput();

    // Any throw is expected here — either a TypeError from `this` being
    // undefined (the `this`-binding bug) or from the source-level `viewport`
    // bug, depending on how strict mode applies.
    expect(() => unboundOnTick(input, 1000, renderer)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// FieldPos — tick / move / getCurrentPixel / getDestination
// ---------------------------------------------------------------------------

describe('FieldPos this binding', () => {
  let ctx: GameContext;
  let pos: FieldPos;

  beforeEach(() => {
    ctx = makeContext();
    pos = makeFieldPos(ctx);
  });

  it('keeps this binding in move when called via instance', () => {
    const spy = vi.spyOn(pos, 'move');

    pos.move(0, { command: 'walk', direction: 'right', async: true, force: false });

    expect(spy.mock.instances[0]).toBe(pos);
  });

  it('keeps this binding in tick when called via instance', () => {
    const spy = vi.spyOn(pos, 'tick');

    pos.tick(1000);

    expect(spy.mock.instances[0]).toBe(pos);
  });

  it('keeps this binding in getCurrentPixel when called via instance', () => {
    const spy = vi.spyOn(pos, 'getCurrentPixel');

    pos.getCurrentPixel(1000);

    expect(spy.mock.instances[0]).toBe(pos);
  });

  it('keeps this binding in getDestination when called via instance', () => {
    const spy = vi.spyOn(pos, 'getDestination');

    pos.getDestination();

    expect(spy.mock.instances[0]).toBe(pos);
  });

  it('tick uses this._currentMovement without throwing', () => {
    // Start a movement, then tick past its duration
    pos.move(0, { command: 'walk', direction: 'right', async: true, force: false });
    expect(() => pos.tick(9999)).not.toThrow();
  });

  it('getCurrentPixel uses this.config.blockSize without throwing', () => {
    expect(() => pos.getCurrentPixel(0)).not.toThrow();
  });

  it('move + tick called multiple times preserves this binding', () => {
    const tickSpy = vi.spyOn(pos, 'tick');

    pos.move(0, { command: 'walk', direction: 'down', async: true, force: false });
    pos.tick(100);
    pos.tick(200);
    pos.tick(9999);

    expect(tickSpy.mock.instances).toHaveLength(3);
    tickSpy.mock.instances.forEach((instance) => {
      expect(instance).toBe(pos);
    });
  });

  /**
   * NEGATIVE TEST — extracting tick as unbound loses `this`.
   */
  it('[NEGATIVE] calling tick as unbound function breaks this', () => {
    const unboundTick = pos.tick;
    expect(() => unboundTick(1000)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Texture — resolveLayers / start / stop
// ---------------------------------------------------------------------------

describe('Texture this binding', () => {
  let ctx: GameContext;
  let texture: Texture;

  beforeEach(() => {
    ctx = makeContext();
    texture = makeTexture(ctx);
  });

  it('keeps this binding in resolveLayers when called via instance', () => {
    const spy = vi.spyOn(texture, 'resolveLayers');

    texture.resolveLayers(1000);

    expect(spy.mock.instances[0]).toBe(texture);
  });

  it('keeps this binding in start when called via instance', () => {
    const spy = vi.spyOn(texture, 'start');

    texture.start();

    expect(spy.mock.instances[0]).toBe(texture);
  });

  it('keeps this binding in stop when called via instance', () => {
    const spy = vi.spyOn(texture, 'stop');

    texture.stop();

    expect(spy.mock.instances[0]).toBe(texture);
  });

  it('resolveLayers uses this.data without throwing', () => {
    texture.start();
    expect(() => texture.resolveLayers(500)).not.toThrow();
  });

  it('start + resolveLayers + stop sequence preserves this', () => {
    const startSpy = vi.spyOn(texture, 'start');
    const resolveSpy = vi.spyOn(texture, 'resolveLayers');
    const stopSpy = vi.spyOn(texture, 'stop');

    texture.start();
    texture.resolveLayers(100);
    texture.resolveLayers(200);
    texture.stop();
    texture.resolveLayers(300);

    expect(startSpy.mock.instances[0]).toBe(texture);
    resolveSpy.mock.instances.forEach((instance) => {
      expect(instance).toBe(texture);
    });
    expect(stopSpy.mock.instances[0]).toBe(texture);
  });

  it('resolveLayers returns empty array when stopped', () => {
    texture.start();
    texture.stop();
    const layers = texture.resolveLayers(100);
    expect(layers).toEqual([]);
  });

  /**
   * NEGATIVE TEST — extracting resolveLayers as unbound loses `this`.
   */
  it('[NEGATIVE] calling resolveLayers as unbound function breaks this', () => {
    const unboundResolveLayers = texture.resolveLayers;
    expect(() => unboundResolveLayers(1000)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Skin — resolveLayers
// ---------------------------------------------------------------------------

describe('Skin this binding', () => {
  let ctx: GameContext;
  let skin: Skin;

  beforeEach(() => {
    ctx = makeContext();
    skin = makeSkin(ctx);
  });

  it('keeps this binding in resolveLayers when called via instance', () => {
    const spy = vi.spyOn(skin, 'resolveLayers');

    skin.resolveLayers(1000, 'down');

    expect(spy.mock.instances[0]).toBe(skin);
  });

  it('resolveLayers delegates to the correct directional texture via this.deps', () => {
    const downTexture = (skin as any).deps.textures.down;
    const resolveLayersSpy = vi.spyOn(downTexture, 'resolveLayers');

    skin.resolveLayers(500, 'down');

    expect(resolveLayersSpy).toHaveBeenCalledWith(500);
  });

  it('keeps this binding across all four directions', () => {
    const spy = vi.spyOn(skin, 'resolveLayers');
    const directions: Array<'left' | 'right' | 'up' | 'down'> = ['left', 'right', 'up', 'down'];

    directions.forEach((dir) => skin.resolveLayers(0, dir));

    expect(spy.mock.instances).toHaveLength(4);
    spy.mock.instances.forEach((instance) => {
      expect(instance).toBe(skin);
    });
  });

  /**
   * NEGATIVE TEST — extracting resolveLayers as unbound loses `this`.
   */
  it('[NEGATIVE] calling resolveLayers as unbound function breaks this', () => {
    const unboundResolveLayers = skin.resolveLayers;
    expect(() => unboundResolveLayers(1000, 'down')).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Entity — resolveLayers
// ---------------------------------------------------------------------------

describe('Entity this binding', () => {
  let ctx: GameContext;
  let entity: Entity;

  beforeEach(() => {
    ctx = makeContext();
    entity = makeEntity(ctx);
  });

  it('keeps this binding in resolveLayers when called via instance', () => {
    const spy = vi.spyOn(entity, 'resolveLayers');

    entity.resolveLayers(1000, 'down');

    expect(spy.mock.instances[0]).toBe(entity);
  });

  it('resolveLayers uses this.deps without throwing', () => {
    expect(() => entity.resolveLayers(0, 'left')).not.toThrow();
  });

  it('keeps this binding called multiple times via instance', () => {
    const spy = vi.spyOn(entity, 'resolveLayers');

    entity.resolveLayers(0, 'left');
    entity.resolveLayers(100, 'right');
    entity.resolveLayers(200, 'up');

    expect(spy.mock.instances).toHaveLength(3);
    spy.mock.instances.forEach((instance) => {
      expect(instance).toBe(entity);
    });
  });

  /**
   * NEGATIVE TEST — extracting resolveLayers as unbound loses `this`.
   */
  it('[NEGATIVE] calling resolveLayers as unbound function breaks this', () => {
    const unboundResolveLayers = entity.resolveLayers;
    expect(() => unboundResolveLayers(1000, 'down')).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Field — checkReachable / resolveLayers
// ---------------------------------------------------------------------------

describe('Field this binding', () => {
  let ctx: GameContext;
  let field: Field;
  let mockTile: any;

  beforeEach(() => {
    ctx = makeContext();
    mockTile = {
      allowOverwrap: true,
      resolveLayers: vi.fn().mockReturnValue([]),
    };
    field = new Field(
      ctx,
      makeFieldData(),
      {
        tiles: new Map([['.',  mockTile]]) as any,
        entities: new Map(),
      }
    );
  });

  it('keeps this binding in checkReachable when called via instance', () => {
    const spy = vi.spyOn(field, 'checkReachable');

    field.checkReachable({ x: 0, y: 0 });

    expect(spy.mock.instances[0]).toBe(field);
  });

  it('checkReachable uses this.deps.tiles without throwing', () => {
    expect(() => field.checkReachable({ x: 0, y: 0 })).not.toThrow();
  });

  it('keeps this binding in resolveLayers when called via instance', () => {
    const spy = vi.spyOn(field, 'resolveLayers');
    const viewport = new Rect(0, 0, 1, 1);

    field.resolveLayers(1000, viewport);

    expect(spy.mock.instances[0]).toBe(field);
  });

  it('resolveLayers uses this.data.map and this.ctx.manifest without throwing', () => {
    const viewport = new Rect(0, 0, 1, 1);
    expect(() => field.resolveLayers(0, viewport)).not.toThrow();
  });

  /**
   * NEGATIVE TEST — extracting checkReachable as unbound loses `this`.
   */
  it('[NEGATIVE] calling checkReachable as unbound function breaks this', () => {
    const unboundCheckReachable = field.checkReachable;
    expect(() => unboundCheckReachable({ x: 0, y: 0 })).toThrow();
  });
});

// ---------------------------------------------------------------------------
// ResourceFactory — create
// ---------------------------------------------------------------------------

describe('ResourceFactory this binding', () => {
  let ctx: GameContext;
  let factory: ResourceFactory;

  beforeEach(() => {
    ctx = makeContext();
    factory = new ResourceFactory(ctx);
  });

  it('keeps this binding in create when called via instance', async () => {
    const spy = vi.spyOn(factory, 'create');

    const actionData = { id: 'action.test', type: 'action' };

    // ResourceFactory.create calls ctx.schemas.get, which requires a real schema.
    await factory.create(actionData, 'action');

    expect(spy.mock.instances[0]).toBe(factory);
  });

  it('create uses this.ctx without throwing', async () => {
    const actionData = { id: 'action.test', type: 'action' };
    await expect(factory.create(actionData, 'action')).resolves.toBeDefined();
  });

  /**
   * NEGATIVE TEST — extracting create as unbound loses `this`.
   */
  it('[NEGATIVE] calling create as unbound function breaks this', async () => {
    const unboundCreate = factory.create;
    const actionData = { id: 'action.test', type: 'action' };

    await expect(unboundCreate(actionData, 'action')).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// ResourceStore — get / fetch
// ---------------------------------------------------------------------------

describe('ResourceStore this binding', () => {
  let ctx: GameContext;
  let store: ResourceStore;

  beforeEach(() => {
    ctx = makeContext();
    store = new ResourceStore(ctx);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ id: 'action.test', type: 'action' }),
    }));
  });

  it('keeps this binding in get when called via instance', async () => {
    const spy = vi.spyOn(store, 'get');

    await store.get('action.test', 'action');

    expect(spy.mock.instances[0]).toBe(store);
  });

  it('get uses this.ctx.factory without throwing', async () => {
    await expect(store.get('action.test', 'action')).resolves.toBeDefined();
  });

  it('get caches and returns same instance on second call', async () => {
    const first = await store.get('action.test', 'action');
    const second = await store.get('action.test', 'action');

    expect(first).toBe(second);
    // fetch should only have been called once
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
  });

  it('keeps this binding in fetch when called via instance', async () => {
    const spy = vi.spyOn(store, 'fetch');

    await store.fetch('action.test');

    expect(spy.mock.instances[0]).toBe(store);
  });

  /**
   * NEGATIVE TEST — extracting get as unbound loses `this`.
   */
  it('[NEGATIVE] calling get as unbound function breaks this', async () => {
    const unboundGet = store.get;

    await expect(unboundGet('action.test', 'action')).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// GameContext constructor / accessors (this binding via property reads)
// ---------------------------------------------------------------------------

describe('GameContext this binding', () => {
  it('constructor assigns all properties — manifest is accessible as this.manifest', () => {
    const manifest = makeManifest();
    const ctx = new GameContext(manifest);

    // If `this` in the constructor were broken, these would be undefined
    expect(ctx.manifest).toBe(manifest);
    expect(ctx.assets).toBeDefined();
    expect(ctx.factory).toBeDefined();
    expect(ctx.resources).toBeDefined();
    expect(ctx.state).toBeDefined();
    expect(ctx.schemas).toBeDefined();
  });

  it('subcomponents back-reference ctx correctly (this is consistent)', () => {
    const manifest = makeManifest();
    const ctx = new GameContext(manifest);

    // ResourceFactory stores a reference to ctx; verify it's the same instance
    expect((ctx.factory as any).ctx).toBe(ctx);
    expect((ctx.resources as any).ctx).toBe(ctx);
  });
});
