import { http, HttpResponse } from 'msw';
import yaml from 'yaml';
import { dt3ToPng, yamlToPng } from '@dev/utils/image/converter';

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
    if (typeof id !== 'string') return;
    const raw = this.resources.get(id);
    return raw ? await yaml.parse(raw) : undefined;
  }

  async readImage(id?: string | readonly string[]) {
    if (typeof id !== 'string') return;
    const yamlText = this.images.get(`${id}.yaml`);
    if (yamlText) return yamlToPng(yamlText);
    const dt3Text = this.images.get(`${id}.dt3`);
    return dt3Text ? await dt3ToPng(dt3Text) : undefined;
  }
}

const resourceLoader = new ResourceLoader();

export const handlers = [
  http.get('/api/resource/:id', async ({ params: { id } }) => {
    const resource = await resourceLoader.readResource(id);
    return resource ? HttpResponse.json(resource) : HttpResponse.json({ error: 'not found' }, { status: 404 });
  }),

  http.get('/api/image/:id', async ({ params: { id } }) => {
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
