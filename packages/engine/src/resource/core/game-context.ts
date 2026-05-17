import type { ManifestData } from '@sharedTypes/resource/manifest';
import type { ResourceConfig } from '@sharedTypes/config';
import type { PanelManager } from '@engine/manager/panel/panel-manager';
import { ResourceStore } from './resource-store';
import { AssetCache } from './asset-cache';
import { GameState } from './game-state';
import { SchemaRegistry } from './schema-registry';
import { ResourceFactory } from './resource-factory';

export class GameContext {
  assets: AssetCache;
  factory: ResourceFactory;
  resources: ResourceStore;
  state: GameState;
  schemas: SchemaRegistry;
  panels?: PanelManager;

  constructor(
    readonly manifest: ManifestData,
    readonly config: ResourceConfig
  ) {
    this.factory = new ResourceFactory(this);
    this.resources = new ResourceStore(this);
    this.assets = new AssetCache(this.resources);
    this.state = new GameState(manifest);
    this.schemas = new SchemaRegistry(manifest);
  }
}
