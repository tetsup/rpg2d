import type z from 'zod';
import type { IdSchema, resources } from '@schema/resource/common/base';
import type { PositionSchema } from '@schema/resource/common/coordinate';
import type { PrimitiveValueSchema } from '@schema/resource/variable/condition';

export type ResourceType = (typeof resources)[number];

export type ResourceId = z.infer<typeof IdSchema>;
export type PrimitiveValue = z.infer<typeof PrimitiveValueSchema>;
export type Position = z.infer<typeof PositionSchema>;
