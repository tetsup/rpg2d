import { zocker } from 'zocker';
import { Action } from '@/resource/action';
import { ResourceManager } from '@/resource/resource-manager';
import { ActionSchema } from '@/schemas/action';

function createMockResources() {
  return {} as unknown as ResourceManager;
}

describe('Action.factory', () => {
  it('正常にインスタンス生成される', async () => {
    const resources = createMockResources();
    const raw = zocker(ActionSchema).generate();
    const action = await Action.factory(resources, raw);

    expect(action).toBeInstanceOf(Action);
  });

  it('schemaバリデーションで失敗する', async () => {
    const resources = createMockResources();
    const raw = zocker(ActionSchema).supply(ActionSchema.shape.type, 'entity').generate();

    await expect(Action.factory(resources, raw)).rejects.toThrow();
  });

  it('schemaに合わないデータは必ず弾かれる', async () => {
    const resources = {} as ResourceManager;
    const raw = zocker(ActionSchema).generate();
    const invalid = {
      ...raw,
      extra: 'unexpected',
    };

    await expect(Action.factory(resources, invalid)).rejects.toThrow();
  });

  it('必須フィールドがない場合エラーになる', async () => {
    const resources = {} as ResourceManager;
    const invalid = {
      id: 'a1',
    };

    await expect(Action.factory(resources, invalid)).rejects.toThrow();
  });

  it('loadDepsが呼ばれる', async () => {
    const resources = createMockResources();
    const spy = vi.spyOn(Action, 'loadDeps');
    const raw = zocker(ActionSchema).generate();
    await Action.factory(resources, raw);

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
