/**
 * Contract tests for the future ActionManager design.
 *
 * These tests intentionally target the requested public contract, not the
 * current implementation. The module under test may not exist yet.
 */

import { describe, expect, it, vi } from 'vitest';

const ACTION_MANAGER_MODULE = new URL('../../../src/engine/action/action-manager.ts', import.meta.url).href;

type SequenceCommand = ReturnType<typeof vi.fn>;

type SequenceContract = {
  blockPlayerInput: boolean;
  blockParallelActions: boolean;
  commands: SequenceCommand[];
};

type ActionStartContext = {
  parallel?: boolean;
};

type ActionManagerContract = {
  start(sequence: SequenceContract, context?: ActionStartContext): void;
  tick(): void;
  hasPlayerBlock(): boolean;
  hasParallelBlock(): boolean;
};

type ActionManagerConstructor = new () => ActionManagerContract;

async function loadActionManager(): Promise<ActionManagerConstructor> {
  try {
    const module = (await import(/* @vite-ignore */ ACTION_MANAGER_MODULE)) as Record<string, unknown>;
    const ActionManager = module.ActionManager;
    if (typeof ActionManager !== 'function') {
      throw new Error('ActionManager export was not found.');
    }
    return ActionManager as ActionManagerConstructor;
  } catch (error) {
    throw new Error(
      `Contract target missing: expected ActionManager export from ${ACTION_MANAGER_MODULE}. Original error: ${String(error)}`
    );
  }
}

async function createActionManager(): Promise<ActionManagerContract> {
  const ActionManager = await loadActionManager();
  return new ActionManager();
}

function makeSequence(opts: {
  blockPlayerInput: boolean;
  blockParallelActions: boolean;
  command?: SequenceCommand;
}): SequenceContract {
  return {
    blockPlayerInput: opts.blockPlayerInput,
    blockParallelActions: opts.blockParallelActions,
    commands: [opts.command ?? vi.fn()],
  };
}

describe('ActionManager contract: blockPlayerInput', () => {
  it('blockPlayerInput=true のsequence実行中はplayer入力を停止する', async () => {
    // arrange
    const manager = await createActionManager();
    const sequence = makeSequence({ blockPlayerInput: true, blockParallelActions: false });

    // act
    manager.start(sequence);

    // assert
    expect(manager.hasPlayerBlock()).toBe(true);
  });

  it('blockPlayerInput=false のsequence実行中はplayer入力を許可する', async () => {
    // arrange
    const manager = await createActionManager();
    const sequence = makeSequence({ blockPlayerInput: false, blockParallelActions: false });

    // act
    manager.start(sequence);

    // assert
    expect(manager.hasPlayerBlock()).toBe(false);
  });
});

describe('ActionManager contract: blockParallelActions', () => {
  it('blockParallelActions=true のsequence実行中はparallel sequenceを進行させない', async () => {
    // arrange
    const manager = await createActionManager();
    const blockingCommand = vi.fn();
    const parallelCommand = vi.fn();
    const blockingSequence = makeSequence({
      blockPlayerInput: false,
      blockParallelActions: true,
      command: blockingCommand,
    });
    const parallelSequence = makeSequence({
      blockPlayerInput: false,
      blockParallelActions: false,
      command: parallelCommand,
    });

    // act
    manager.start(blockingSequence);
    manager.start(parallelSequence, { parallel: true });
    manager.tick();

    // assert
    expect(manager.hasParallelBlock()).toBe(true);
    expect(blockingCommand).toHaveBeenCalledTimes(1);
    expect(parallelCommand).not.toHaveBeenCalled();
  });

  it('blockParallelActions=false のsequence実行中はparallel sequenceを進行させる', async () => {
    // arrange
    const manager = await createActionManager();
    const foregroundCommand = vi.fn();
    const parallelCommand = vi.fn();
    const foregroundSequence = makeSequence({
      blockPlayerInput: false,
      blockParallelActions: false,
      command: foregroundCommand,
    });
    const parallelSequence = makeSequence({
      blockPlayerInput: false,
      blockParallelActions: false,
      command: parallelCommand,
    });

    // act
    manager.start(foregroundSequence);
    manager.start(parallelSequence, { parallel: true });
    manager.tick();

    // assert
    expect(manager.hasParallelBlock()).toBe(false);
    expect(foregroundCommand).toHaveBeenCalledTimes(1);
    expect(parallelCommand).toHaveBeenCalledTimes(1);
  });
});

describe('ActionManager contract: block flag combinations', () => {
  it.each([
    {
      name: 'blockPlayerInput=true, blockParallelActions=false',
      blockPlayerInput: true,
      blockParallelActions: false,
      expectedPlayerBlock: true,
      expectedParallelBlock: false,
    },
    {
      name: 'blockPlayerInput=true, blockParallelActions=true',
      blockPlayerInput: true,
      blockParallelActions: true,
      expectedPlayerBlock: true,
      expectedParallelBlock: true,
    },
    {
      name: 'blockPlayerInput=false, blockParallelActions=true',
      blockPlayerInput: false,
      blockParallelActions: true,
      expectedPlayerBlock: false,
      expectedParallelBlock: true,
    },
    {
      name: 'blockPlayerInput=false, blockParallelActions=false',
      blockPlayerInput: false,
      blockParallelActions: false,
      expectedPlayerBlock: false,
      expectedParallelBlock: false,
    },
  ])('$name', async ({ blockPlayerInput, blockParallelActions, expectedPlayerBlock, expectedParallelBlock }) => {
    // arrange
    const manager = await createActionManager();
    const sequence = makeSequence({ blockPlayerInput, blockParallelActions });

    // act
    manager.start(sequence);

    // assert
    expect(manager.hasPlayerBlock()).toBe(expectedPlayerBlock);
    expect(manager.hasParallelBlock()).toBe(expectedParallelBlock);
  });
});

describe('ActionManager contract: multiple simultaneous actions', () => {
  it('複数sequence中、1つでもblockPlayerInput=trueならplayer blockが成立する', async () => {
    // arrange
    const manager = await createActionManager();
    const nonBlockingSequence = makeSequence({ blockPlayerInput: false, blockParallelActions: false });
    const playerBlockingSequence = makeSequence({ blockPlayerInput: true, blockParallelActions: false });

    // act
    manager.start(nonBlockingSequence);
    manager.start(playerBlockingSequence, { parallel: true });

    // assert
    expect(manager.hasPlayerBlock()).toBe(true);
  });

  it('複数sequence中、1つでもblockParallelActions=trueならparallel blockが成立する', async () => {
    // arrange
    const manager = await createActionManager();
    const nonBlockingSequence = makeSequence({ blockPlayerInput: false, blockParallelActions: false });
    const parallelBlockingSequence = makeSequence({ blockPlayerInput: false, blockParallelActions: true });

    // act
    manager.start(nonBlockingSequence);
    manager.start(parallelBlockingSequence, { parallel: true });

    // assert
    expect(manager.hasParallelBlock()).toBe(true);
  });
});
