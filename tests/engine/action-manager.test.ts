import { ActionManager, type Sequence } from '@/engine/action/action-manager';
import { PanelManager } from '@/engine/panel/panel-manager';
import { MessagePanel, type Message } from '@/engine/panel/message-panel';
import type { GameContext } from '@/resource/core/game-context';
import type { Panel } from '@/resource/domain/panel/panel';
import type { MessageConfig } from '@/schemas/manifest';
import { describe, expect, it, vi } from 'vitest';

function makeMessage(typeMessage = 'こんにちは'): Message[] {
  return [{ type: 'simple', message: typeMessage }];
}

function makePanel(): Panel {
  return {
    panelRect: { width: 10, height: 4 },
    setTextAreas: vi.fn(),
  } as unknown as Panel;
}

function makeContext(overrides: {
  variables?: Map<string, string | number>;
  getPanel?: ReturnType<typeof vi.fn>;
} = {}): GameContext {
  const messageConfig: MessageConfig = {
    speedMs: 0,
    margin: { left: 0, right: 0, top: 0, bottom: 0 },
  };
  return {
    manifest: {
      config: {
        defaultMessagePanel: 'local.panel.message.v0',
        messageConfig,
      },
    },
    resources: {
      get: overrides.getPanel ?? vi.fn().mockResolvedValue(makePanel()),
    },
    state: {
      variables: overrides.variables ?? new Map(),
    },
  } as unknown as GameContext;
}

describe('ActionManager', () => {
  it('message commandでdefaultMessagePanel resourceからMessagePanelを生成する', async () => {
    const panelManager = new PanelManager();
    const getPanel = vi.fn().mockResolvedValue(makePanel());
    const ctx = makeContext({ getPanel });
    const manager = new ActionManager({ ctx, panelManager });
    const sequence: Sequence = {
      blockPlayerInput: true,
      blockParallelActions: true,
      commands: [{ type: 'message', messages: makeMessage() }],
    };

    manager.start(sequence);
    manager.tick(0, {});
    await vi.waitFor(() => expect(panelManager.top()).toBeInstanceOf(MessagePanel));

    expect(getPanel).toHaveBeenCalledWith('local.panel.message.v0', 'panel');
    expect(panelManager.hasOpenPanel()).toBe(true);
  });

  it('panelが開いている間sequenceを停止し、閉じたら再開する', async () => {
    const panelManager = new PanelManager();
    const manager = new ActionManager({ ctx: makeContext(), panelManager });
    const afterClose = vi.fn();
    const sequence: Sequence = {
      blockPlayerInput: true,
      blockParallelActions: true,
      commands: [{ type: 'message', messages: makeMessage() }, afterClose],
    };

    manager.start(sequence);
    manager.tick(0, {});
    await vi.waitFor(() => expect(panelManager.hasOpenPanel()).toBe(true));
    manager.tick(0, {});

    expect(afterClose).not.toHaveBeenCalled();

    panelManager.clear();
    manager.tick(0, {});

    expect(afterClose).toHaveBeenCalledTimes(1);
  });

  it('wait commandを指定tick数で進行する', () => {
    const manager = new ActionManager();
    const afterWait = vi.fn();
    const sequence: Sequence = {
      blockPlayerInput: false,
      blockParallelActions: false,
      commands: [{ type: 'wait', ticks: 2 }, afterWait],
    };

    manager.start(sequence);
    manager.tick();

    expect(afterWait).not.toHaveBeenCalled();

    manager.tick();

    expect(afterWait).toHaveBeenCalledTimes(1);
  });

  it('branch commandはcondition true/falseで遷移先を切り替える', () => {
    const trueCommand = vi.fn();
    const falseCommand = vi.fn();
    const baseSequence = {
      blockPlayerInput: false,
      blockParallelActions: false,
    };

    const trueManager = new ActionManager({
      ctx: makeContext({ variables: new Map([['flag', 1]]) }),
    });
    trueManager.start({
      ...baseSequence,
      commands: [
        { type: 'branch', condition: { path: 'flag', operator: '==', value: 1 }, trueTo: 1, falseTo: 3 },
        trueCommand,
        { type: 'end' },
        falseCommand,
      ],
    });
    trueManager.tick();

    expect(trueCommand).toHaveBeenCalledTimes(1);
    expect(falseCommand).not.toHaveBeenCalled();

    const falseManager = new ActionManager({
      ctx: makeContext({ variables: new Map([['flag', 0]]) }),
    });
    falseManager.start({
      ...baseSequence,
      commands: [
        { type: 'branch', condition: { path: 'flag', operator: '==', value: 1 }, trueTo: 1, falseTo: 3 },
        vi.fn(),
        { type: 'end' },
        falseCommand,
      ],
    });
    falseManager.tick();

    expect(falseCommand).toHaveBeenCalledTimes(1);
  });

  it('jump commandは指定indexへ移動する', () => {
    const manager = new ActionManager();
    const skipped = vi.fn();
    const jumped = vi.fn();
    const sequence: Sequence = {
      blockPlayerInput: false,
      blockParallelActions: false,
      commands: [{ type: 'jump', to: 2 }, skipped, jumped],
    };

    manager.start(sequence);
    manager.tick();

    expect(skipped).not.toHaveBeenCalled();
    expect(jumped).toHaveBeenCalledTimes(1);
  });

  it('block判定は実行中sequenceのflagを集約する', () => {
    const manager = new ActionManager();

    manager.start({ blockPlayerInput: true, blockParallelActions: false, commands: [{ type: 'wait', ticks: 1 }] });
    manager.start(
      { blockPlayerInput: false, blockParallelActions: true, commands: [{ type: 'wait', ticks: 1 }] },
      { parallel: true }
    );

    expect(manager.hasPlayerBlock()).toBe(true);
    expect(manager.hasParallelBlock()).toBe(true);
    expect(manager.count()).toBe(2);
  });
});
