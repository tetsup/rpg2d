import { describe, expect, it, vi } from 'vitest';
import { MessagePanel } from '@/engine/panel/message-panel';
import { PanelManager, type ManagedPanel } from '@/engine/panel/panel-manager';
import type { RpgKey } from '@/types/engine';

const inputKeys = ['left', 'right', 'up', 'down', 'enter', 'esc'] as const satisfies readonly RpgKey[];

type InputPanel = ManagedPanel & {
  sendKey: ReturnType<typeof vi.fn>;
};

function makePanel(id: string): ManagedPanel {
  return {
    id,
    active: false,
    tick: vi.fn(),
    render: vi.fn(),
    onOpen: vi.fn(),
    onClose: vi.fn(),
    onActive: vi.fn(),
    onInactive: vi.fn(),
  };
}

function makeInputPanel(id: string): InputPanel {
  return {
    ...makePanel(id),
    sendKey: vi.fn(),
  };
}

describe('PanelManager', () => {
  it('pushでtopのみactiveにする', () => {
    const manager = new PanelManager();
    const panelA = makePanel('A');
    const panelB = makePanel('B');

    manager.push(panelA);

    expect(panelA.active).toBe(true);
    expect(panelA.onOpen).toHaveBeenCalledTimes(1);
    expect(panelA.onActive).toHaveBeenCalledTimes(1);

    manager.push(panelB);

    expect(panelA.active).toBe(false);
    expect(panelB.active).toBe(true);
    expect(panelA.onInactive).toHaveBeenCalledTimes(1);
    expect(panelB.onOpen).toHaveBeenCalledTimes(1);
    expect(panelB.onActive).toHaveBeenCalledTimes(1);
    expect(manager.top()).toBe(panelB);
    expect(manager.size()).toBe(2);
  });

  it('popで1つ前のpanelをactiveに復帰する', () => {
    const manager = new PanelManager();
    const panelA = makePanel('A');
    const panelB = makePanel('B');
    manager.push(panelA);
    manager.push(panelB);

    const popped = manager.pop();

    expect(popped).toBe(panelB);
    expect(panelA.active).toBe(true);
    expect(panelB.active).toBe(false);
    expect(panelB.onClose).toHaveBeenCalledTimes(1);
    expect(panelA.onActive).toHaveBeenCalledTimes(2);
    expect(manager.top()).toBe(panelA);
  });

  it('tickはtop panelのみに呼び出す', () => {
    const manager = new PanelManager();
    const input = { enter: true };
    const panelA = makePanel('A');
    const panelB = makePanel('B');
    manager.push(panelA);
    manager.push(panelB);

    const blocked = manager.tick(0, input);

    expect(panelA.tick).not.toHaveBeenCalled();
    expect(panelB.tick).toHaveBeenCalledTimes(1);
    expect(panelB.tick).toHaveBeenCalledWith(0);
    expect(blocked).toBe(true);
  });

  it('clearは全panelをclose扱いで除去する', () => {
    const manager = new PanelManager();
    const panelA = makePanel('A');
    const panelB = makePanel('B');
    manager.push(panelA);
    manager.push(panelB);

    manager.clear();

    expect(panelA.active).toBe(false);
    expect(panelB.active).toBe(false);
    expect(panelA.onClose).toHaveBeenCalledTimes(1);
    expect(panelB.onClose).toHaveBeenCalledTimes(1);
    expect(manager.hasOpenPanel()).toBe(false);
    expect(manager.top()).toBeUndefined();
    expect(manager.size()).toBe(0);
  });

  it('replaceはtopを入れ替える', () => {
    const manager = new PanelManager();
    const panelA = makePanel('A');
    const panelB = makePanel('B');
    manager.push(panelA);

    const replaced = manager.replace(panelB);

    expect(replaced).toBe(panelA);
    expect(panelA.active).toBe(false);
    expect(panelB.active).toBe(true);
    expect(panelA.onClose).toHaveBeenCalledTimes(1);
    expect(panelB.onOpen).toHaveBeenCalledTimes(1);
    expect(panelB.onActive).toHaveBeenCalledTimes(1);
    expect(manager.top()).toBe(panelB);
    expect(manager.size()).toBe(1);
  });

  it('renderはstack順にtopを最後に描画する', () => {
    const manager = new PanelManager();
    const calls: string[] = [];
    const panelA = { ...makePanel('A'), render: vi.fn(() => calls.push('A')) };
    const panelB = { ...makePanel('B'), render: vi.fn(() => calls.push('B')) };
    manager.push(panelA);
    manager.push(panelB);

    manager.render();

    expect(calls).toEqual(['A', 'B']);
  });

  it('空のpopはthrowせずnoopにする', () => {
    const manager = new PanelManager();

    expect(() => manager.pop()).not.toThrow();
    expect(manager.pop()).toBeUndefined();
  });

  it('panelがないtickはfieldを止めない', () => {
    const manager = new PanelManager();

    expect(manager.tick(100, { enter: true })).toBe(false);
  });

  it('MessagePanel pushでtop管理し、通常panel tick形式で呼び出す', () => {
    const manager = new PanelManager();
    const messagePanel = {
      id: 'message',
      active: false,
      tick: vi.fn(),
      sendKey: vi.fn(),
      status: { phase: 'loading' },
    } as unknown as MessagePanel;

    manager.push(messagePanel);
    manager.tick(100, { enter: true, esc: false });

    expect(manager.top()).toBe(messagePanel);
    expect(messagePanel.active).toBe(true);
    expect(messagePanel.sendKey).toHaveBeenCalledTimes(1);
    expect(messagePanel.sendKey).toHaveBeenCalledWith('enter');
    expect(messagePanel.tick).toHaveBeenCalledTimes(1);
    expect(messagePanel.tick).toHaveBeenCalledWith(100);
  });

  it('closeで前panelへ復帰する', () => {
    const manager = new PanelManager();
    const panelA = makePanel('A');
    const panelB = { ...makePanel('B'), isClosed: true };
    manager.push(panelA);
    manager.push(panelB);

    manager.tick(100, {});

    expect(manager.top()).toBe(panelA);
    expect(panelA.active).toBe(true);
    expect(panelB.active).toBe(false);
    expect(panelB.onClose).toHaveBeenCalledTimes(1);
  });

  it('sendKeyは押した瞬間のedgeだけtop panelへ送る', () => {
    const manager = new PanelManager();
    const panel = { ...makePanel('input'), sendKey: vi.fn() };
    manager.push(panel);

    manager.tick(100, { enter: true });
    manager.tick(101, { enter: true });
    manager.tick(102, { enter: false });
    manager.tick(103, { enter: true });

    expect(panel.sendKey).toHaveBeenCalledTimes(2);
    expect(panel.sendKey).toHaveBeenNthCalledWith(1, 'enter');
    expect(panel.sendKey).toHaveBeenNthCalledWith(2, 'enter');
  });
});

describe('PanelManager input routing', () => {
  it('only top panel receives key', () => {
    const manager = new PanelManager();
    const lowerPanel = makeInputPanel('lower');
    const topPanel = makeInputPanel('top');
    manager.push(lowerPanel);
    manager.push(topPanel);

    manager.tick(100, { enter: true });

    expect(lowerPanel.sendKey).not.toHaveBeenCalled();
    expect(topPanel.sendKey).toHaveBeenCalledTimes(1);
    expect(topPanel.sendKey).toHaveBeenCalledWith('enter');
  });

  it.each(inputKeys)('edge press triggers once for %s', (key) => {
    const manager = new PanelManager();
    const panel = makeInputPanel('input');
    const pressedInput: Partial<Record<RpgKey, boolean>> = { [key]: true };
    manager.push(panel);

    manager.tick(100, pressedInput);
    manager.tick(101, pressedInput);

    expect(panel.sendKey).toHaveBeenCalledTimes(1);
    expect(panel.sendKey).toHaveBeenCalledWith(key);
  });

  it.each(inputKeys)('release then press triggers %s again', (key) => {
    const manager = new PanelManager();
    const panel = makeInputPanel('input');
    const pressedInput: Partial<Record<RpgKey, boolean>> = { [key]: true };
    const releasedInput: Partial<Record<RpgKey, boolean>> = { [key]: false };
    manager.push(panel);

    manager.tick(100, pressedInput);
    manager.tick(101, pressedInput);
    manager.tick(102, releasedInput);
    manager.tick(103, pressedInput);

    expect(panel.sendKey).toHaveBeenCalledTimes(2);
    expect(panel.sendKey).toHaveBeenNthCalledWith(1, key);
    expect(panel.sendKey).toHaveBeenNthCalledWith(2, key);
  });

  it('does nothing when no panel exists', () => {
    const manager = new PanelManager();

    expect(() => manager.tick(100, { enter: true })).not.toThrow();
    expect(manager.tick(100, { enter: true })).toBe(false);
  });
});
