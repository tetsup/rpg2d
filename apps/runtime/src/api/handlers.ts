import { http, HttpResponse } from 'msw';
import yaml from 'yaml';
import { formatResourceId, ResourcePathSchema } from '@schema/resource/common/base';
import { BadRequestError, execWithHandleError, NotFoundError } from './errors';

class ResourceLoader {
  private resources: Map<string, string>;

  constructor() {
    this.resources = new Map(
      Object.values(
        import.meta.glob<string>('../../../../fixtures/resources/**/*', {
          eager: true,
          query: '?raw',
          import: 'default',
        })
      )
        .map((resource) => yaml.parse(resource))
        .map((resource) => [`${resource.namespace}/${resource.type}/${resource.name}`, resource])
    );
  }

  async readResource(id?: string | readonly string[]) {
    if (typeof id !== 'string') throw new BadRequestError();
    const data = this.resources.get(id);
    if (data === undefined) throw new NotFoundError();
    return data;
  }
}

const resourceLoader = new ResourceLoader();

export const handlers = [
  http.get(
    '/api/resources/:namespace/:type/:name',
    async ({ params }) =>
      await execWithHandleError(async () => {
        const { namespace, type, name } = ResourcePathSchema.parse(params);
        const resource = await resourceLoader.readResource(`${namespace}/${type}/${name}`);
        if (resource == null) throw new NotFoundError();
        return HttpResponse.json({
          ...resource,
          id: formatResourceId({ namespace, type, name }),
          isDraft: resource.isDraft ?? false,
          createdBy: resource.createdBy ?? 'mock',
        });
      })
  ),
];
