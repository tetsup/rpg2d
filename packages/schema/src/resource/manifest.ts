import z from 'zod';
import { IdSchema } from './common/base';
import { DirectionSchema, PositionSchema, SizeSchema } from './common/coordinate';
import { PrimitiveValueSchema } from './variable/condition';
import { StateDefinitionSchema } from './variable/definition';

export const ModeSchema = z.enum(['menu', 'field', 'battle']);

export const VariableStateSchema = z.record(IdSchema, PrimitiveValueSchema);

export const InitialPlayersSchema = z.array(IdSchema);

export const InitialCoreStateSchema = z.object({
  players: InitialPlayersSchema,
  variables: VariableStateSchema,
  mode: ModeSchema,
});

export const InitialFieldStateSchema = z.object({
  fieldId: IdSchema,
  pos: PositionSchema,
  direction: DirectionSchema,
  actionIds: z.array(IdSchema),
});

export const InitialStateSchema = z.object({
  core: InitialCoreStateSchema,
  field: InitialFieldStateSchema,
});

export const DslSchema = z.object({
  playerState: StateDefinitionSchema,
});

export const MessageConfigSchema = z.object({
  speedMs: z.number().int().min(0),
  margin: z.object({
    left: z.number().int().min(0),
    right: z.number().int().min(0),
    top: z.number().int().min(0),
    bottom: z.number().int().min(0),
  }),
});

export const ConfigSchema = z.object({
  blockSize: SizeSchema,
  textSize: SizeSchema,
  moveDurationMs: z.number().int().min(0),
  screen: SizeSchema,
  defaultMessagePanel: IdSchema,
  messageConfig: MessageConfigSchema,
});

export const ManifestSchema = z.object({
  initialState: InitialStateSchema,
  schemas: DslSchema,
  config: ConfigSchema,
});
