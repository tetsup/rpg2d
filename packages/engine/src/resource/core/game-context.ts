import type { ManifestData } from '@sharedTypes/resource/manifest';
import type { ResourceConfig } from '@sharedTypes/config';
import type { PanelManager, PanelManagerLike } from '@engine/manager/panel/panel-manager';
import { ResourceStore, type ResourceStoreLike } from './resource-store';
import { AssetCache, type AssetCacheLike } from './asset-cache';
import { GameState, type GameStateLike } from './game-state';
import { SchemaRegistry, type SchemaRegistryLike } from './schema-registry';
import { ResourceFactory, type ResourceFactoryLike } from './resource-factory';

export interface GameContextLike {
  readonly manifest: ManifestData;
  readonly config: ResourceConfig;
  assets: AssetCacheLike;
  factory: ResourceFactoryLike;
  resources: ResourceStoreLike;
  state: GameStateLike;
  schemas: SchemaRegistryLike;
  panels?: PanelManagerLike;
}

export class GameContext implements GameContextLike {
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
