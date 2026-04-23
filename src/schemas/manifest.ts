import z from 'zod';
import { DirectionSchema, IdSchema, PositionSchema, PrimitiveValueSchema } from '@/schemas/common';
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

export const BlockSizeSchema = z.object({ width: z.number().int().min(1), height: z.number().int().min(1) });

export const ConfigSchema = z.object({
  blockSize: BlockSizeSchema,
  walkingTimePerBlock: z.number().int().min(100).max(5000),
});

export const ManifestSchema = z.object({
  initialState: InitialStateSchema,
  schemas: DslSchema,
  config: ConfigSchema,
});

export type Manifest = z.infer<typeof ManifestSchema>;
