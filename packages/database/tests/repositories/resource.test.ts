import { saveResource, findResourceById } from '@database/repositories/resource';

describe('resource repository', () => {
  it('saves resource', async () => {
    await saveResource({
      id: 'sample/player/hero.v0',

      data: {
        hp: 100,
      },
    });
    console.log('saved');
    const resource = await findResourceById('sample/player/hero.v0');
    expect(resource).toBeTruthy();
    expect(resource?.data).toEqual({
      hp: 100,
    });
  });
});
