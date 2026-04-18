import z from 'zod';
import { ConditionSchema } from './condition';

export const LayerValueSchema = z.union([z.string(), z.null()]);

export const LayersSchema = z.record(z.string(), LayerValueSchema);

export type LayersData = z.infer<typeof LayersSchema>;

export const AppearanceRuleSchema = z.object({
  when: ConditionSchema,
  set: LayersSchema,
});

export type AppearanceRuleData = z.infer<typeof AppearanceRuleSchema>;

export const AppearanceSchema = z.object({
  default: LayersSchema,
  rules: z.array(AppearanceRuleSchema).default([]),
});

export type AppearanceData = z.infer<typeof AppearanceSchema>;
