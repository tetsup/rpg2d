import { actionId, createContext, isoTimestamp, useResourceResponses } from './resource-fetch-test-utils';

describe('resource fetch data errors', () => {
  it('throws schema.parse error when data is missing', async () => {
    useResourceResponses({
      [actionId]: {
        namespace: 'sample',
        type: 'action',
        name: 'welcome.v0',
        version: 0,
        createdAt: isoTimestamp,
        updatedAt: isoTimestamp,
        sequence: [],
      },
    });

    const ctx = createContext();
    const createSpy = vi.spyOn(ctx.factory, 'create');

    await expect(ctx.resources.get(actionId, 'action')).rejects.toThrow();
    expect(createSpy).not.toHaveBeenCalled();
  });
});
