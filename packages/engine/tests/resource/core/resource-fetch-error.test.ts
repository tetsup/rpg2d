import { actionId, createContext, isoTimestamp, useResourceResponses } from './resource-fetch-test-utils';

const legacyActionBody = {
  sequence: [],
};

describe('resource fetch errors', () => {
  it('throws before ResourceFactory.create when identifier fields are missing', async () => {
    useResourceResponses({
      [actionId]: legacyActionBody,
    });

    const ctx = createContext();
    const createSpy = vi.spyOn(ctx.factory, 'create');

    await expect(ctx.resources.get(actionId, 'action')).rejects.toThrow();
    expect(createSpy).not.toHaveBeenCalled();
  });

  it.each([
    {
      name: 'missing name',
      body: {
        namespace: 'sample',
        type: 'action',
        version: 0,
        createdAt: isoTimestamp,
        updatedAt: isoTimestamp,
        data: { sequence: [] },
        sequence: [],
      },
    },
    {
      name: 'invalid namespace',
      body: {
        namespace: 'sa',
        type: 'action',
        name: 'welcome.v0',
        version: 0,
        createdAt: isoTimestamp,
        updatedAt: isoTimestamp,
        data: { sequence: [] },
        sequence: [],
      },
    },
  ])('throws immediately for corrupted identifier structure: $name', async ({ body }) => {
    useResourceResponses({
      [actionId]: body,
    });

    const ctx = createContext();
    const createSpy = vi.spyOn(ctx.factory, 'create');

    await expect(ctx.resources.get(actionId, 'action')).rejects.toThrow();
    expect(createSpy).not.toHaveBeenCalled();
  });
});
