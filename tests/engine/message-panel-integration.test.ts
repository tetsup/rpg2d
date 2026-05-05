import { describe, expect, it, vi } from 'vitest';
import { MessagePanel, type Message } from '@/engine/panel/message-panel';
import { PanelManager, type ManagedPanel } from '@/engine/panel/panel-manager';
import type { GameContext } from '@/resource/core/game-context';
import type { Panel } from '@/resource/domain/panel/panel';
import type { MessageConfig } from '@/schemas/manifest';

function makeMessages(message = 'hello'): Message[] {
  return [{ type: 'simple', message }];
}

function makePanelResource(): Panel {
  return {
    id: 'panel.message',
    active: false,
    panelRect: { width: 12, height: 4 },
    setTextAreas: vi.fn(),
  } as unknown as Panel;
}

function makeContext(overrides: { getPanel?: ReturnType<typeof vi.fn>; messageConfig?: MessageConfig } = {}): GameContext {
  const messageConfig = overrides.messageConfig ?? {
    speedMs: 1,
    margin: { left: 0, right: 0, top: 0, bottom: 0 },
  };
  return {
    manifest: {
      config: {
        defaultMessagePanel: 'panel.message',
        messageConfig,
      },
    },
    resources: {
      get: overrides.getPanel ?? vi.fn().mockResolvedValue(makePanelResource()),
    },
  } as unknown as GameContext;
}

function makeManagedPanel(id: string): ManagedPanel & { sendKey: ReturnType<typeof vi.fn> } {
  return {
    id,
    active: false,
    tick: vi.fn(),
    sendKey: vi.fn(),
  };
}

describe('MessagePanel integration', () => {
  it('openMessages pushes MessagePanel onto stack', async () => {
    const getPanel = vi.fn().mockResolvedValue(makePanelResource());
    const manager = new PanelManager(makeContext({ getPanel }));

    await manager.openMessages(makeMessages());

    expect(getPanel).toHaveBeenCalledWith('panel.message', 'panel');
    expect(manager.top()).toBeInstanceOf(MessagePanel);
    expect(manager.hasOpenPanel()).toBe(true);
  });

  it('MessagePanel receives top panel input only', async () => {
    const manager = new PanelManager(makeContext());
    const lowerPanel = makeManagedPanel('menu');
    manager.push(lowerPanel);
    await manager.openMessages(makeMessages());

    const messagePanel = manager.top();
    expect(messagePanel).toBeInstanceOf(MessagePanel);
    expect(typeof messagePanel?.sendKey).toBe('function');

    const sendKey = vi.spyOn(messagePanel as MessagePanel, 'sendKey');
    manager.tick(0, { enter: true });

    expect(lowerPanel.sendKey).not.toHaveBeenCalled();
    expect(sendKey).toHaveBeenCalledTimes(1);
    expect(sendKey).toHaveBeenCalledWith('enter');
  });

  it('enter closes or advances message', async () => {
    const manager = new PanelManager(makeContext());
    await manager.openMessages(makeMessages('hello'));
    const messagePanel = manager.top();
    expect(messagePanel).toBeInstanceOf(MessagePanel);

    manager.tick(0, {});
    expect((messagePanel as MessagePanel).status.phase).toBe('running');

    manager.tick(1, { enter: true });

    expect((messagePanel as MessagePanel).status.phase).toBe('waiting');
    expect(manager.hasOpenPanel()).toBe(true);
  });

  it('esc closes message panel', async () => {
    const manager = new PanelManager(makeContext());
    await manager.openMessages(makeMessages('hello'));

    manager.tick(0, {});
    manager.tick(10, {});
    manager.tick(11, { esc: true });
    manager.tick(12, { esc: false });

    expect(manager.hasOpenPanel()).toBe(false);
    expect(manager.top()).toBeUndefined();
  });

  it('closing restores field pass-through', async () => {
    const manager = new PanelManager(makeContext());
    await manager.openMessages(makeMessages('hello'));

    expect(manager.tick(0, {})).toBe(true);
    manager.tick(10, {});
    manager.tick(11, { enter: true });
    manager.tick(12, { enter: false });

    expect(manager.tick(13, {})).toBe(false);
  });
});
