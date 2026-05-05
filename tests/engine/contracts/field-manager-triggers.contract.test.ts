/**
 * Contract tests for the future FieldManager trigger design.
 *
 * These tests intentionally target the requested public contract, not the
 * current implementation. The module under test may not exist yet.
 */

import { describe, expect, it, vi } from 'vitest';

const FIELD_MANAGER_MODULE = new URL('../../../src/engine/field/field-manager.ts', import.meta.url).href;

type SequenceContract = {
  blockPlayerInput: boolean;
  blockParallelActions: boolean;
  commands: unknown[];
};

type EntityContract = {
  id: string;
  onCheck?: SequenceContract;
  onTouch?: SequenceContract;
  onAuto?: SequenceContract;
};

type TileContract = {
  id: string;
  onEnter?: SequenceContract;
  onStay?: SequenceContract;
  onExit?: SequenceContract;
  onCheck?: SequenceContract;
};

type ActionManagerContract = {
  start(sequence: SequenceContract, context?: unknown): void;
};

type EntityManagerContract = {
  checkedEntity(): EntityContract | undefined;
  touchedEntity(): EntityContract | undefined;
  autoEntities(): EntityContract[];
};

type TileTriggerManagerContract = {
  enteredTile(): TileContract | undefined;
  stayingTile(): TileContract | undefined;
  exitedTile(): TileContract | undefined;
  checkedTile(): TileContract | undefined;
};

type FieldManagerContract = {
  tickPlayerInput(input: unknown): void;
  tickWorld(): void;
  triggerCheck(): void;
  triggerTouch(): void;
  triggerTile(): void;
};

type FieldManagerConstructor = new (deps: {
  actionManager: ActionManagerContract;
  entityManager: EntityManagerContract;
  tileTriggerManager: TileTriggerManagerContract;
}) => FieldManagerContract;

async function loadFieldManager(): Promise<FieldManagerConstructor> {
  try {
    const module = (await import(/* @vite-ignore */ FIELD_MANAGER_MODULE)) as Record<string, unknown>;
    const FieldManager = module.FieldManager;
    if (typeof FieldManager !== 'function') {
      throw new Error('FieldManager export was not found.');
    }
    return FieldManager as FieldManagerConstructor;
  } catch (error) {
    throw new Error(
      `Contract target missing: expected FieldManager export from ${FIELD_MANAGER_MODULE}. Original error: ${String(error)}`
    );
  }
}

async function createFieldManager(deps: {
  actionManager: ActionManagerContract;
  entityManager?: Partial<EntityManagerContract>;
  tileTriggerManager?: Partial<TileTriggerManagerContract>;
}): Promise<FieldManagerContract> {
  const FieldManager = await loadFieldManager();
  return new FieldManager({
    actionManager: deps.actionManager,
    entityManager: {
      checkedEntity: vi.fn().mockReturnValue(undefined),
      touchedEntity: vi.fn().mockReturnValue(undefined),
      autoEntities: vi.fn().mockReturnValue([]),
      ...deps.entityManager,
    },
    tileTriggerManager: {
      enteredTile: vi.fn().mockReturnValue(undefined),
      stayingTile: vi.fn().mockReturnValue(undefined),
      exitedTile: vi.fn().mockReturnValue(undefined),
      checkedTile: vi.fn().mockReturnValue(undefined),
      ...deps.tileTriggerManager,
    },
  });
}

function makeSequence(name: string): SequenceContract {
  return {
    blockPlayerInput: true,
    blockParallelActions: false,
    commands: [{ command: name }],
  };
}

function makeActionManager(): ActionManagerContract {
  return {
    start: vi.fn(),
  };
}

describe('FieldManager contract: Entity Trigger', () => {
  it('onCheckを持つentityを調べたとき、そのsequenceを開始する', async () => {
    // arrange
    const actionManager = makeActionManager();
    const onCheck = makeSequence('entity.onCheck');
    const entity: EntityContract = { id: 'npc.check', onCheck };
    const manager = await createFieldManager({
      actionManager,
      entityManager: {
        checkedEntity: vi.fn().mockReturnValue(entity),
      },
    });

    // act
    manager.triggerCheck();

    // assert
    expect(actionManager.start).toHaveBeenCalledTimes(1);
    expect(actionManager.start).toHaveBeenCalledWith(onCheck, expect.objectContaining({ source: entity, trigger: 'onCheck' }));
  });

  it('onTouchを持つentityに接触したとき、そのsequenceを開始する', async () => {
    // arrange
    const actionManager = makeActionManager();
    const onTouch = makeSequence('entity.onTouch');
    const entity: EntityContract = { id: 'npc.touch', onTouch };
    const manager = await createFieldManager({
      actionManager,
      entityManager: {
        touchedEntity: vi.fn().mockReturnValue(entity),
      },
    });

    // act
    manager.triggerTouch();

    // assert
    expect(actionManager.start).toHaveBeenCalledTimes(1);
    expect(actionManager.start).toHaveBeenCalledWith(onTouch, expect.objectContaining({ source: entity, trigger: 'onTouch' }));
  });

  it('onAutoを持つentityがfield上にいるとき、tickWorldでそのsequenceを開始する', async () => {
    // arrange
    const actionManager = makeActionManager();
    const autoA = makeSequence('entity.autoA');
    const autoB = makeSequence('entity.autoB');
    const entityA: EntityContract = { id: 'npc.autoA', onAuto: autoA };
    const entityB: EntityContract = { id: 'npc.autoB', onAuto: autoB };
    const manager = await createFieldManager({
      actionManager,
      entityManager: {
        autoEntities: vi.fn().mockReturnValue([entityA, entityB]),
      },
    });

    // act
    manager.tickWorld();

    // assert
    expect(actionManager.start).toHaveBeenCalledTimes(2);
    expect(actionManager.start).toHaveBeenNthCalledWith(
      1,
      autoA,
      expect.objectContaining({ source: entityA, trigger: 'onAuto' })
    );
    expect(actionManager.start).toHaveBeenNthCalledWith(
      2,
      autoB,
      expect.objectContaining({ source: entityB, trigger: 'onAuto' })
    );
  });
});

describe('FieldManager contract: Tile Trigger', () => {
  it('onEnterを持つtileへ進入したとき、そのsequenceを開始する', async () => {
    // arrange
    const actionManager = makeActionManager();
    const onEnter = makeSequence('tile.onEnter');
    const tile: TileContract = { id: 'tile.enter', onEnter };
    const manager = await createFieldManager({
      actionManager,
      tileTriggerManager: {
        enteredTile: vi.fn().mockReturnValue(tile),
      },
    });

    // act
    manager.triggerTile();

    // assert
    expect(actionManager.start).toHaveBeenCalledTimes(1);
    expect(actionManager.start).toHaveBeenCalledWith(onEnter, expect.objectContaining({ source: tile, trigger: 'onEnter' }));
  });

  it('onStayを持つtile上に滞在しているとき、そのsequenceを開始する', async () => {
    // arrange
    const actionManager = makeActionManager();
    const onStay = makeSequence('tile.onStay');
    const tile: TileContract = { id: 'tile.stay', onStay };
    const manager = await createFieldManager({
      actionManager,
      tileTriggerManager: {
        stayingTile: vi.fn().mockReturnValue(tile),
      },
    });

    // act
    manager.triggerTile();

    // assert
    expect(actionManager.start).toHaveBeenCalledTimes(1);
    expect(actionManager.start).toHaveBeenCalledWith(onStay, expect.objectContaining({ source: tile, trigger: 'onStay' }));
  });

  it('onExitを持つtileから退出したとき、そのsequenceを開始する', async () => {
    // arrange
    const actionManager = makeActionManager();
    const onExit = makeSequence('tile.onExit');
    const tile: TileContract = { id: 'tile.exit', onExit };
    const manager = await createFieldManager({
      actionManager,
      tileTriggerManager: {
        exitedTile: vi.fn().mockReturnValue(tile),
      },
    });

    // act
    manager.triggerTile();

    // assert
    expect(actionManager.start).toHaveBeenCalledTimes(1);
    expect(actionManager.start).toHaveBeenCalledWith(onExit, expect.objectContaining({ source: tile, trigger: 'onExit' }));
  });

  it('onCheckを持つtileを調べたとき、そのsequenceを開始する', async () => {
    // arrange
    const actionManager = makeActionManager();
    const onCheck = makeSequence('tile.onCheck');
    const tile: TileContract = { id: 'tile.check', onCheck };
    const manager = await createFieldManager({
      actionManager,
      tileTriggerManager: {
        checkedTile: vi.fn().mockReturnValue(tile),
      },
    });

    // act
    manager.triggerTile();

    // assert
    expect(actionManager.start).toHaveBeenCalledTimes(1);
    expect(actionManager.start).toHaveBeenCalledWith(onCheck, expect.objectContaining({ source: tile, trigger: 'onCheck' }));
  });
});
