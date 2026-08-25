import type { ResourceData } from '@sharedTypes/resource/common';
import type { ResourceDeps } from '@engine/types/resource-deps';
import type { GameContextLike } from '@engine/resource/core/game-context';
import type { PreviewableResourceType, PreviewResourceInstanceMap } from '../preview-factory';

export interface PreviewResourceInstance<T extends PreviewableResourceType> {
  readonly ctx: GameContextLike<PreviewResourceInstanceMap>;
  readonly id: string;
  readonly data: ResourceData<T>;
  readonly deps: ResourceDeps<T>;
}

export class PreviewResourceBase<T extends PreviewableResourceType> implements PreviewResourceInstance<T> {
  constructor(
    readonly ctx: GameContextLike<PreviewResourceInstanceMap>,
    readonly id: string,
    readonly data: ResourceData<T>,
    readonly deps: ResourceDeps<T>
  ) {}
}
