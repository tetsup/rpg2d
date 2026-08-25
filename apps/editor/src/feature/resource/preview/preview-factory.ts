import { GameContextLike } from '@engine/resource/core/game-context';
import type { ResourceFactoryLike } from '@engine/resource/core/resource-factory';
import { PreviewImage } from './classes/image';

const PreviewResourceClassMap = { image: PreviewImage };

export type PreviewResourceClassMap = typeof PreviewResourceClassMap;

export type PreviewResourceInstanceMap = {
  [K in keyof typeof PreviewResourceClassMap]: InstanceType<(typeof PreviewResourceClassMap)[K]>;
};

export type PreviewableResourceType = keyof typeof PreviewResourceClassMap;

export class PreviewResourceFactory implements ResourceFactoryLike<PreviewResourceInstanceMap> {
  constructor(private ctx: GameContextLike<PreviewResourceInstanceMap>) {}

  create = async <K extends keyof PreviewResourceInstanceMap>(id: string, data: any, type: K) => {
    const cls = PreviewResourceClassMap[type];
    const schema = this.ctx.schemas.get(type);
    const parsed = schema.parse(data) as any;
    const deps = (await cls.loadDeps(this.ctx, parsed)) as any;

    return new cls(this.ctx, id, parsed, deps);
  };
}
