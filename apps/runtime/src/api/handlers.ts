import { http, HttpResponse } from 'msw';
import yaml from 'yaml';
import { BadRequestError, execWithHandleError, NotFoundError } from './errors';
import { ResourceGetParamsSchema } from '@schema/api/resource';

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
    '/api/resource/:namespace/:type/:id',
    async ({ params }) =>
      await execWithHandleError(async () => {
        const { namespace, type, id } = ResourceGetParamsSchema.parse(params);
        const resource = await resourceLoader.readResource(`${namespace}/${type}/${id}`);
        if (resource == null) throw new NotFoundError();
        return HttpResponse.json(resource);
      })
  ),
];
