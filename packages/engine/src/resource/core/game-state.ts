import type { ResourceId } from '@sharedTypes/resource/common';
import type { ManifestData } from '@sharedTypes/resource/manifest';
import type { VariableState } from '@sharedTypes/engine';

export class GameState {
  variables: Map<ResourceId, VariableState>;

  constructor(manifest: ManifestData) {
    this.variables = new Map();
    Object.entries(manifest.initialState.core.variables).forEach(([key, value]) => {
      this.variables.set(key, value);
    });
  }
}
