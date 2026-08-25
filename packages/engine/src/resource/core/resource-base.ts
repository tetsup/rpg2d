import type { ResourceDeps } from '@engine/types/resource-deps';
import type { ResourceData, ResourceType } from '@sharedTypes/resource/common';
import type { GameContextLike } from './game-context';

export interface ResourceInstance<T extends ResourceType> {
  readonly ctx: GameContextLike;
  readonly id: string;
  readonly data: ResourceData<T>;
  readonly deps: ResourceDeps<T>;
}

export class ResourceBase<T extends ResourceType> implements ResourceInstance<T> {
  constructor(
    readonly ctx: GameContextLike,
    readonly id: string,
    readonly data: ResourceData<T>,
    readonly deps: ResourceDeps<T>
  ) {}
}
