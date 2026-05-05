export interface ManagedPanel {
  id: string;
  active: boolean;
  tick?(input: unknown): void;
  render?(): void;
  onOpen?(): void;
  onClose?(): void;
  onActive?(): void;
  onInactive?(): void;
}

export class PanelManager {
  private readonly stack: ManagedPanel[] = [];

  push(panel: ManagedPanel): void {
    this.assertPanel(panel);

    const currentTop = this.top();
    if (currentTop) {
      currentTop.active = false;
      currentTop.onInactive?.();
    }

    this.stack.push(panel);
    panel.active = true;
    panel.onOpen?.();
    panel.onActive?.();
    this.syncActiveState();
  }

  pop(): ManagedPanel | undefined {
    const closedPanel = this.stack.pop();
    if (!closedPanel) return undefined;

    closedPanel.active = false;
    closedPanel.onClose?.();

    const nextTop = this.top();
    if (nextTop) {
      nextTop.active = true;
      nextTop.onActive?.();
    }

    this.syncActiveState();
    return closedPanel;
  }

  replace(panel: ManagedPanel): ManagedPanel | undefined {
    const closedPanel = this.pop();
    this.push(panel);
    return closedPanel;
  }

  top(): ManagedPanel | undefined {
    return this.stack.at(-1);
  }

  hasOpenPanel(): boolean {
    return this.stack.length > 0;
  }

  tick(input: unknown): void {
    this.top()?.tick?.(input);
  }

  render(): void {
    for (const panel of this.stack) {
      panel.render?.();
    }
  }

  size(): number {
    return this.stack.length;
  }

  clear(): void {
    while (this.stack.length > 0) {
      const panel = this.stack.pop();
      if (!panel) continue;
      panel.active = false;
      panel.onClose?.();
    }
  }

  private assertPanel(panel: ManagedPanel): void {
    if (panel === null || panel === undefined) {
      throw new TypeError('PanelManager requires a panel instance.');
    }
  }

  private syncActiveState(): void {
    const topIndex = this.stack.length - 1;
    this.stack.forEach((panel, index) => {
      panel.active = index === topIndex;
    });
  }
}
