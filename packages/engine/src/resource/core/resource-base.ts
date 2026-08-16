import type { ResourceData, ResourceType } from '@sharedTypes/resource/common';
import type { ResourceDeps } from '@engine/types/resource-deps';
import type { GameContextLike } from './game-context';

export abstract class ResourceBase<K extends ResourceType> {
  constructor(
    protected ctx: GameContextLike,
    protected data: ResourceData<K>,
    protected deps: ResourceDeps<K>
  ) {}

  static loadDeps = async (ctx: GameContextLike, data: any): Promise<any> => {
    void ctx;
    void data;
    return {};
  };
}
