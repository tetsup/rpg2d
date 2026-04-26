import z from 'zod';
import { DirectionSchema, IdSchema, PositionSchema, PrimitiveValueSchema, SizeSchema } from '@/schemas/common';
import { StateDefinitionSchema } from './playerState';

export const ModeSchema = z.enum(['menu', 'field', 'battle']);

export const VariableStateSchema = z.map(IdSchema, PrimitiveValueSchema);

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

export type InitialFieldState = z.infer<typeof InitialFieldStateSchema>;

export const InitialStateSchema = z.object({
  core: InitialCoreStateSchema,
  field: InitialFieldStateSchema,
});

export const DslSchema = z.object({
  playerState: StateDefinitionSchema,
});

export const ConfigSchema = z.object({
  blockSize: SizeSchema,
  moveDurationMs: z.number().int().min(0),
  screen: SizeSchema,
});

export const ManifestSchema = z.object({
  initialState: InitialStateSchema,
  schemas: DslSchema,
  config: ConfigSchema,
});

export type Manifest = z.infer<typeof ManifestSchema>;
