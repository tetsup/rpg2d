import type { PanelData, PanelDeps } from '@/schemas/panel/panel';
import { ResourceBase } from '@/resource/core/resource-base';
import type { GameContext } from '@/resource/core/game-context';
import { Rect } from '@/utils/rect';
import type { TextArea } from './panel-skin';
import { RpgKey } from '@/types/engine';

export class Panel extends ResourceBase<'panel'> {
  protected textAreas: TextArea[] = [];
  protected visible: boolean = false;
  protected childPanel: Panel | null = null;
  private parent: Panel | null = null;
  panelRect: Rect;

  constructor(ctx: GameContext, data: PanelData, deps: PanelDeps) {
    super(ctx, data, deps);
    this.panelRect = this.resolveRect();
  }

  static async loadDeps(ctx: GameContext, data: PanelData): Promise<PanelDeps> {
    const skin = await ctx.resources.get(data.skin, 'panel-skin');
    return { skin };
  }

  setTextAreas(textAreas: TextArea[]) {
    this.textAreas = textAreas;
  }

  protected open() {
    this.visible = true;
  }

  protected close() {
    this.visible = false;
  }

  setParent = (parent: Panel) => {
    this.parent = parent;
  };

  openChild = async (id: string) => {
    this.childPanel = await this.ctx.resources.get(id, 'panel');
    if (this.childPanel == null) throw new Error('failed to get child panel');
    this.childPanel.setParent(this);
    this.childPanel.open();
  };

  private resolveAnchorPos = () => {
    const screenBlocks = {
      width: Math.floor(this.ctx.manifest.config.screen.width / this.ctx.manifest.config.blockSize.width),
      height: Math.floor(this.ctx.manifest.config.screen.height / this.ctx.manifest.config.blockSize.height),
    };
    if (this.data.layout.anchorType === 'parent' && this.parent != null) {
      switch (this.data.layout.anchor) {
        case 'top-left':
          return this.parent.panelRect.topLeft;
        case 'top-right':
          return this.parent.panelRect.topRight;
        case 'bottom-left':
          return this.parent.panelRect.bottomLeft;
        case 'bottom-right':
          return this.parent.panelRect.bottomRight;
      }
    }
    switch (this.data.layout.anchor) {
      case 'top-left':
        return { x: 0, y: 0 };
      case 'top-right':
        return { x: screenBlocks.width, y: 0 };
      case 'bottom-left':
        return { x: 0, y: screenBlocks.height };
      case 'bottom-right':
        return { x: screenBlocks.width, y: screenBlocks.height };
    }
  };

  private resolveRect = () => {
    const anchor = this.resolveAnchorPos();
    return new Rect(
      anchor.x + this.data.layout.pos.x,
      anchor.y + this.data.layout.pos.y,
      this.data.layout.size.width,
      this.data.layout.size.height
    );
  };

  resolveLayers = (nowMs: number) => {
    if (!this.visible) return [];
    return this.deps.skin.resolveLayers(nowMs, this.panelRect, this.textAreas);
  };
}
