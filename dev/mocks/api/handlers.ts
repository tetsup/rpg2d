import { http, HttpResponse } from 'msw';
import yaml from 'yaml';
import { dt3ToPng, yamlToPng } from '@dev/utils/image/converter';
import { BadRequestError, execWithHandleError, InternalServerError, NotFoundError } from './errors';

function pathToId(path: string) {
  return path
    .split('/')
    .at(-1)
    ?.replace(/.(yaml|dt3)$/, '')!;
}

class ResourceLoader {
  private resources: Map<string, string>;
  private images: Map<string, string>;

  constructor() {
    this.resources = new Map(
      Object.entries(
        import.meta.glob<string>('../../resources/**/*', { eager: true, query: '?raw', import: 'default' })
      ).map(([path, loader]) => [pathToId(path), loader])
    );
    this.images = new Map(
      Object.entries(
        import.meta.glob<string>('../../images/**/*', { eager: true, query: '?raw', import: 'default' })
      ).map(([path, loader]) => [pathToId(path), loader])
    );
  }

  async readResource(id?: string | readonly string[]) {
    if (typeof id !== 'string') throw new BadRequestError();
    const raw = this.resources.get(id);
    if (raw === undefined) throw new NotFoundError();
    return await yaml.parse(raw);
  }

  async readImage(id?: string | readonly string[]) {
    if (typeof id !== 'string') throw new BadRequestError();
    const raw = this.images.get(id);
    if (raw === undefined) throw new NotFoundError();
    try {
      return yamlToPng(raw);
    } catch (e) {
      try {
        return dt3ToPng(raw);
      } catch (e) {
        throw new InternalServerError((e as any)?.message);
      }
    }
  }
}

const resourceLoader = new ResourceLoader();

export const handlers = [
  http.get(
    '/api/resource/:id',
    async ({ params: { id } }) =>
      await execWithHandleError(async () => {
        const resource = await resourceLoader.readResource(id);
        return HttpResponse.json(resource);
      })
  ),

  http.get(
    '/api/image/:id',
    async ({ params: { id } }) =>
      await execWithHandleError(async () => {
        const image = await resourceLoader.readImage(id);
        return HttpResponse.arrayBuffer(image, {
          headers: {
            'Content-Type': 'image/png',
          },
        });
      })
  ),
];
