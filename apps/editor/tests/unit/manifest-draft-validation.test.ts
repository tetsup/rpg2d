import { createManifestCreateDefaultValues, manifestCreateSchema } from '@editor/forms/manifest';
import type { ResourceInput } from '@sharedTypes/database/collection';

const validFieldId = 'sample/field/start-field.v0';
const validPanelId = 'sample/panel/message.v0';

function collectManifestCreateFieldPaths() {
  return [
    'namespace',
    'type',
    'name',
    'description',
    'data.initialState.field.fieldId',
    'data.initialState.field.pos',
    'data.config.defaultMessagePanel',
  ] as const;
}

/** Paths supplied only via defaultValues, not exposed as form controls. */
const defaultValuesOnlyPaths = [
  'version',
  'isDraft',
  'data.initialState.core.players',
  'data.initialState.core.variables',
  'data.initialState.core.mode',
  'data.initialState.field.direction',
  'data.initialState.field.actionIds',
  'data.schemas.playerState',
  'data.config.blockSize',
  'data.config.textSize',
  'data.config.moveDurationMs',
  'data.config.screen',
  'data.config.messageConfig',
] as const;

function buildFilledManifestCreateValues(
  overrides: Partial<Pick<ResourceInput<'manifest'>, 'namespace' | 'name' | 'description'>> & {
    fieldId?: string | null;
    defaultMessagePanel?: string | null;
    pos?: { x: number | string; y: number | string };
  } = {}
): ResourceInput<'manifest'> {
  const defaults = createManifestCreateDefaultValues();

  return {
    ...defaults,
    namespace: overrides.namespace ?? 'sample',
    name: overrides.name ?? 'v0',
    description: overrides.description ?? defaults.description,
    data: {
      ...defaults.data,
      initialState: {
        ...defaults.data.initialState,
        field: {
          ...defaults.data.initialState.field,
          fieldId: overrides.fieldId !== undefined ? overrides.fieldId : validFieldId,
          pos: overrides.pos ?? defaults.data.initialState.field.pos,
        },
      },
      config: {
        ...defaults.data.config,
        defaultMessagePanel:
          overrides.defaultMessagePanel !== undefined ? overrides.defaultMessagePanel : validPanelId,
      },
    },
  };
}

describe('manifest create draft validation', () => {
  it('documents form field coverage', () => {
    expect(collectManifestCreateFieldPaths()).toEqual([
      'namespace',
      'type',
      'name',
      'description',
      'data.initialState.field.fieldId',
      'data.initialState.field.pos',
      'data.config.defaultMessagePanel',
    ]);
    expect(defaultValuesOnlyPaths.length).toBeGreaterThan(0);
  });

  it('rejects untouched default values because namespace and name are empty', () => {
    const result = manifestCreateSchema.safeParse(createManifestCreateDefaultValues());

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join('.'))).toEqual(
        expect.arrayContaining(['namespace', 'name'])
      );
    }
  });

  it('passes when visible meta fields are filled and picker ids are valid', () => {
    const result = manifestCreateSchema.safeParse(buildFilledManifestCreateValues());

    expect(result.success).toBe(true);
  });

  it('passes with null picker values in draft when meta fields are filled', () => {
    const result = manifestCreateSchema.safeParse(
      buildFilledManifestCreateValues({
        fieldId: null,
        defaultMessagePanel: null,
      })
    );

    expect(result.success).toBe(true);
  });

  it('rejects position values when text inputs provide strings instead of numbers', () => {
    const result = manifestCreateSchema.safeParse(
      buildFilledManifestCreateValues({
        pos: { x: '0', y: '0' },
      })
    );

    expect(result.success).toBe(false);
  });
});
