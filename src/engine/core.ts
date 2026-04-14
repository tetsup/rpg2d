import type { Game } from '@tetsup/web2d';
import type { RpgState, RpgManifest } from '@/types/engine';
import { ResourceManager } from '@/resource/resource-manager';

export class RpgCore implements Game<any> {
  private state: RpgState;
  private resources: ResourceManager;
  constructor(manifest: RpgManifest) {
    this.state = {
      variableStates: new Map(),
      mode: 'field',
      playerPos: { fieldId: '', pos: { x: 0, y: 0 } },
      presenceWindows: [],
    };
    this.resources = new ResourceManager(manifest);
  }
  async init() {
    this.state = this.resources.initialState;
  }
  async tick() {}
}
