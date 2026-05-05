/**
 * Contract tests for the future GameEngine coordination design.
 *
 * These tests intentionally target the requested public contract, not the
 * current implementation. The module under test may not exist yet.
 */

import { describe, expect, it, vi } from 'vitest';

const GAME_ENGINE_MODULE = new URL('../../../src/engine/game-engine.ts', import.meta.url).href;

type InputContract = Record<string, unknown>;

type SequenceCommand =
  | {
      type: 'openPanel';
      panel: PanelContract;
    }
  | ReturnType<typeof vi.fn>;

type SequenceContract = {
  blockPlayerInput: boolean;
  blockParallelActions: boolean;
  commands: SequenceCommand[];
};

type PanelContract = {
  id: string;
  tick: ReturnType<typeof vi.fn>;
};

type PanelManagerContract = {
  push(panel: PanelContract): void;
  pop(): PanelContract | undefined;
  top(): PanelContract | undefined;
  hasOpenPanel(): boolean;
  tick(input: InputContract): void;
};

type ActionManagerContract = {
  start(sequence: SequenceContract, context?: unknown): void;
  tick(): void;
  hasPlayerBlock(): boolean;
  hasParallelBlock(): boolean;
};

type FieldManagerContract = {
  tickPlayerInput(input: InputContract): void;
  tickWorld(): void;
  triggerCheck(): void;
  triggerTouch(): void;
  triggerTile(): void;
};

type GameEngineContract = {
  tick(input: InputContract): void;
};

type GameEngineConstructor = new (deps: {
  panelManager: PanelManagerContract;
  actionManager: ActionManagerContract;
  fieldManager: FieldManagerContract;
}) => GameEngineContract;

async function loadGameEngine(): Promise<GameEngineConstructor> {
  try {
    const module = (await import(/* @vite-ignore */ GAME_ENGINE_MODULE)) as Record<string, unknown>;
    const GameEngine = module.GameEngine;
    if (typeof GameEngine !== 'function') {
      throw new Error('GameEngine export was not found.');
    }
    return GameEngine as GameEngineConstructor;
  } catch (error) {
    throw new Error(
      `Contract target missing: expected GameEngine export from ${GAME_ENGINE_MODULE}. Original error: ${String(error)}`
    );
  }
}

async function createGameEngine(deps: {
  panelManager?: Partial<PanelManagerContract>;
  actionManager?: Partial<ActionManagerContract>;
  fieldManager?: Partial<FieldManagerContract>;
}): Promise<{
  engine: GameEngineContract;
  panelManager: PanelManagerContract;
  actionManager: ActionManagerContract;
  fieldManager: FieldManagerContract;
}> {
  const GameEngine = await loadGameEngine();
  const panelManager = makePanelManager(deps.panelManager);
  const actionManager = makeActionManager(deps.actionManager);
  const fieldManager = makeFieldManager(deps.fieldManager);

  return {
    engine: new GameEngine({ panelManager, actionManager, fieldManager }),
    panelManager,
    actionManager,
    fieldManager,
  };
}

function makePanel(id: string): PanelContract {
  return {
    id,
    tick: vi.fn(),
  };
}

function makePanelManager(overrides?: Partial<PanelManagerContract>): PanelManagerContract {
  return {
    push: vi.fn(),
    pop: vi.fn(),
    top: vi.fn().mockReturnValue(undefined),
    hasOpenPanel: vi.fn().mockReturnValue(false),
    tick: vi.fn(),
    ...overrides,
  };
}

function makeActionManager(overrides?: Partial<ActionManagerContract>): ActionManagerContract {
  return {
    start: vi.fn(),
    tick: vi.fn(),
    hasPlayerBlock: vi.fn().mockReturnValue(false),
    hasParallelBlock: vi.fn().mockReturnValue(false),
    ...overrides,
  };
}

function makeFieldManager(overrides?: Partial<FieldManagerContract>): FieldManagerContract {
  return {
    tickPlayerInput: vi.fn(),
    tickWorld: vi.fn(),
    triggerCheck: vi.fn(),
    triggerTouch: vi.fn(),
    triggerTile: vi.fn(),
    ...overrides,
  };
}

describe('GameEngine contract: Action blockPlayerInput coordination', () => {
  it('ActionManager.hasPlayerBlock() がtrueならFieldManager.tickPlayerInputを呼ばない', async () => {
    // arrange
    const input = { direction: 'right' };
    const { engine, fieldManager } = await createGameEngine({
      actionManager: {
        hasPlayerBlock: vi.fn().mockReturnValue(true),
      },
    });

    // act
    engine.tick(input);

    // assert
    expect(fieldManager.tickPlayerInput).not.toHaveBeenCalled();
  });

  it('ActionManager.hasPlayerBlock() がfalseならFieldManager.tickPlayerInputを呼ぶ', async () => {
    // arrange
    const input = { direction: 'right' };
    const { engine, fieldManager } = await createGameEngine({
      actionManager: {
        hasPlayerBlock: vi.fn().mockReturnValue(false),
      },
    });

    // act
    engine.tick(input);

    // assert
    expect(fieldManager.tickPlayerInput).toHaveBeenCalledTimes(1);
    expect(fieldManager.tickPlayerInput).toHaveBeenCalledWith(input);
  });
});

describe('GameEngine contract: Panel open input coordination', () => {
  it('panel open中はFieldManager.tickPlayerInputを呼ばず、top panelのみtickする', async () => {
    // arrange
    const input = { enter: true };
    const messagePanel = makePanel('message');
    const choicePanel = makePanel('choice');
    const panelManager = makePanelManager({
      hasOpenPanel: vi.fn().mockReturnValue(true),
      top: vi.fn().mockReturnValue(choicePanel),
      tick: vi.fn((receivedInput: InputContract) => {
        choicePanel.tick(receivedInput);
      }),
    });
    const { engine, fieldManager } = await createGameEngine({
      panelManager,
    });

    // act
    engine.tick(input);

    // assert
    expect(fieldManager.tickPlayerInput).not.toHaveBeenCalled();
    expect(panelManager.tick).toHaveBeenCalledTimes(1);
    expect(panelManager.tick).toHaveBeenCalledWith(input);
    expect(choicePanel.tick).toHaveBeenCalledTimes(1);
    expect(choicePanel.tick).toHaveBeenCalledWith(input);
    expect(messagePanel.tick).not.toHaveBeenCalled();
  });
});

describe('GameEngine contract: Sequence opens panel and waits', () => {
  it('panel open command実行後はpanelが閉じるまでsequenceを待機し、close後に再開する', async () => {
    // arrange
    const input = { enter: true };
    const panel = makePanel('message');
    const beforeOpen = vi.fn();
    const afterClose = vi.fn();
    const sequence: SequenceContract = {
      blockPlayerInput: true,
      blockParallelActions: true,
      commands: [beforeOpen, { type: 'openPanel', panel }, afterClose],
    };
    const panelOpenState = { open: false };
    const panelManager = makePanelManager({
      push: vi.fn(() => {
        panelOpenState.open = true;
      }),
      pop: vi.fn(() => {
        panelOpenState.open = false;
        return panel;
      }),
      top: vi.fn(() => (panelOpenState.open ? panel : undefined)),
      hasOpenPanel: vi.fn(() => panelOpenState.open),
      tick: vi.fn(),
    });
    const actionManager = makeActionManager();
    const { engine } = await createGameEngine({ panelManager, actionManager });

    // act
    actionManager.start(sequence);
    engine.tick(input);

    // assert
    expect(beforeOpen).toHaveBeenCalledTimes(1);
    expect(panelManager.push).toHaveBeenCalledTimes(1);
    expect(panelManager.push).toHaveBeenCalledWith(panel);
    expect(afterClose).not.toHaveBeenCalled();

    // act
    panelManager.pop();
    engine.tick(input);

    // assert
    expect(afterClose).toHaveBeenCalledTimes(1);
  });
});
