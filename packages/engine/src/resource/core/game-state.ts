import type { ResourceId } from '@sharedTypes/resource/common';
import type { ManifestData } from '@sharedTypes/resource/manifest';
import type { VariableState } from '@sharedTypes/engine';

export interface GameStateLike {
  get: (id: ResourceId) => VariableState | undefined;
}

export class GameState implements GameStateLike {
  private variables: Map<ResourceId, VariableState>;

  constructor(manifest: ManifestData) {
    this.variables = new Map();
    Object.entries(manifest.initialState.core.variables).forEach(([key, value]) => {
      this.variables.set(key, value);
    });
  }

  get = (id: ResourceId) => this.variables.get(id);
}
