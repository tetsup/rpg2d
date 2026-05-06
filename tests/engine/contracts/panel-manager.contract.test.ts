/**
 * Contract tests for the future PanelManager design.
 *
 * These tests intentionally target the requested public contract, not the
 * current implementation. The module under test may not exist yet.
 */

import { describe, expect, it, vi } from 'vitest';

const PANEL_MANAGER_MODULE = new URL('../../../src/engine/panel/panel-manager.ts', import.meta.url).href;

type PanelContract = {
  id: string;
  tick: ReturnType<typeof vi.fn>;
};

type PanelManagerContract = {
  push(panel: PanelContract): void;
  pop(): PanelContract | undefined;
  top(): PanelContract | undefined;
  hasOpenPanel(): boolean;
  tick(nowMs: number, input: unknown): void;
};

type PanelManagerConstructor = new () => PanelManagerContract;

async function loadPanelManager(): Promise<PanelManagerConstructor> {
  try {
    const module = (await import(/* @vite-ignore */ PANEL_MANAGER_MODULE)) as Record<string, unknown>;
    const PanelManager = module.PanelManager;
    if (typeof PanelManager !== 'function') {
      throw new Error('PanelManager export was not found.');
    }
    return PanelManager as PanelManagerConstructor;
  } catch (error) {
    throw new Error(
      `Contract target missing: expected PanelManager export from ${PANEL_MANAGER_MODULE}. Original error: ${String(error)}`
    );
  }
}

async function createPanelManager(): Promise<PanelManagerContract> {
  const PanelManager = await loadPanelManager();
  return new PanelManager();
}

function makePanel(id: string): PanelContract {
  return {
    id,
    tick: vi.fn(),
  };
}

describe('PanelManager contract: panel priority control', () => {
  it('panelが1つ以上ある場合はtopのみがactiveになり、下層panelには入力が渡らない', async () => {
    // arrange
    const manager = await createPanelManager();
    const input = { enter: true };
    const messagePanel = makePanel('message');
    const choicePanel = makePanel('choice');

    // act
    manager.push(messagePanel);
    manager.push(choicePanel);
    manager.tick(100, input);

    // assert
    expect(manager.hasOpenPanel()).toBe(true);
    expect(manager.top()).toBe(choicePanel);
    expect(choicePanel.tick).toHaveBeenCalledTimes(1);
    expect(choicePanel.tick).toHaveBeenCalledWith(100, input);
    expect(messagePanel.tick).not.toHaveBeenCalled();
  });

  it('choiceをpopすると1つ前のmessage panelが復帰して入力を受け取る', async () => {
    // arrange
    const manager = await createPanelManager();
    const input = { enter: true };
    const messagePanel = makePanel('message');
    const choicePanel = makePanel('choice');
    manager.push(messagePanel);
    manager.push(choicePanel);

    // act
    const popped = manager.pop();
    manager.tick(100, input);

    // assert
    expect(popped).toBe(choicePanel);
    expect(manager.hasOpenPanel()).toBe(true);
    expect(manager.top()).toBe(messagePanel);
    expect(choicePanel.tick).not.toHaveBeenCalled();
    expect(messagePanel.tick).toHaveBeenCalledTimes(1);
    expect(messagePanel.tick).toHaveBeenCalledWith(100, input);
  });

  it('最後のpanelをpopするとopen panelなしになりtickしても入力は消費されない', async () => {
    // arrange
    const manager = await createPanelManager();
    const input = { enter: true };
    const messagePanel = makePanel('message');
    manager.push(messagePanel);

    // act
    const popped = manager.pop();
    manager.tick(100, input);

    // assert
    expect(popped).toBe(messagePanel);
    expect(manager.hasOpenPanel()).toBe(false);
    expect(manager.top()).toBeUndefined();
    expect(messagePanel.tick).not.toHaveBeenCalled();
  });
});
