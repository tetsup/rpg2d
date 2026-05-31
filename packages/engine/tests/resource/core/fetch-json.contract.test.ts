import {
  actionId,
  createContext,
  entityId,
  expectIsoString,
  loadResourceFixture,
  useResourceResponses,
} from './resource-fetch-test-utils';

describe('resource fetch contract', () => {
  it('fetches YAML-shaped resource JSON and creates an action resource', async () => {
    const action = loadResourceFixture<any>('actions/local.action.welcome.v0.yaml');
    const entity = loadResourceFixture<any>('entities/local.entity.welcome.v0.yaml');

    useResourceResponses({
      [actionId]: action,
      [entityId]: entity,
    });

    const ctx = createContext();
    const createSpy = vi.spyOn(ctx.factory, 'create');

    const resource = await ctx.resources.get(actionId, 'action');

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        namespace: 'sample',
        type: 'action',
        name: 'welcome.v0',
      }),
      'action'
    );

    const data = (resource as any).data;

    expect(data).toEqual(
      expect.objectContaining({
        namespace: 'sample',
        type: 'action',
        name: 'welcome.v0',
        version: 0,
      })
    );
    expect(data).not.toHaveProperty('id');
    expectIsoString(data.createdAt);
    expectIsoString(data.updatedAt);
    expect(data.data).toEqual(
      expect.objectContaining({
        sequence: action.data.sequence,
      })
    );
  });
});
