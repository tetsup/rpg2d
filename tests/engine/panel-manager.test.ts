import { describe, expect, it, vi } from 'vitest';
import { PanelManager, type ManagedPanel } from '@/engine/panel/panel-manager';

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

    manager.tick(input);

    expect(panelA.tick).not.toHaveBeenCalled();
    expect(panelB.tick).toHaveBeenCalledTimes(1);
    expect(panelB.tick).toHaveBeenCalledWith(input);
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
});
