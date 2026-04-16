import { dt3ToPng, yamlToPng } from '@dev/utils/image-converter';
import { http, HttpResponse } from 'msw';
import yaml from 'yaml';

function pathToId(path: string) {
  return path.replace(/^\.\/resources\//, '').replace(/\//g, '.');
}

class ResourceLoader {
  private resources: Map<string, () => Promise<string>>;
  private images: Map<string, () => Promise<string>>;

  constructor() {
    this.resources = new Map(
      Object.entries(import.meta.glob('../resources/yaml/**/*.yaml', { as: 'raw' })).map(([path, loader]) => [
        pathToId(path),
        loader,
      ])
    );
    this.images = new Map(
      Object.entries(import.meta.glob('../images/**/*', { as: 'raw' })).map(([path, loader]) => [
        pathToId(path),
        loader,
      ])
    );
  }

  async readResource(id?: string | readonly string[]) {
    if (typeof id !== 'string') return;
    const raw = await this.resources.get(`${id}.yaml`)?.();
    return raw ? await yaml.parse(raw) : undefined;
  }

  async readImage(id?: string | readonly string[]) {
    if (typeof id !== 'string') return;
    const yamlText = await this.images.get(`${id}.yaml`)?.();
    if (yamlText) return yamlToPng(yamlText);
    const dt3Text = await this.images.get(`${id}.dt3`)?.();
    return dt3Text ? dt3ToPng(dt3Text) : undefined;
  }
}

const resourceLoader = new ResourceLoader();

export const handlers = [
  http.get('/api/resources/:id', async ({ params: { id } }) => {
    const resource = await resourceLoader.readResource(id);
    return resource ? HttpResponse.json(resource) : HttpResponse.json({ error: 'not found' }, { status: 404 });
  }),

  http.get('/api/images/:id', async ({ params: { id } }) => {
    const image = await resourceLoader.readImage(id);
    return image
      ? HttpResponse.arrayBuffer(image, {
          headers: {
            'Content-Type': 'image/png',
          },
        })
      : HttpResponse.json({ error: 'not found' }, { status: 404 });
  }),
];
