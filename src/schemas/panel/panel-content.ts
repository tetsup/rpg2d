import z from 'zod';
import { IdSchema, PositionSchema, SizeSchema } from '../common';
import { ActionSchema } from '../action/action';

const panelContentTypes = ['message', 'menu-list', 'data-list'] as const;
const overflowTreatments = ['hide', 'turn-down'] as const;

const TextPositioningSchema = z.object({
  pos: PositionSchema,
  size: SizeSchema,
  overflow: z.enum(overflowTreatments),
});

const StaticContentSchema = z.object({
  positioning: TextPositioningSchema,
  content: z.string().min(1),
});

const VariantContentSchema = z.object({
  positioning: TextPositioningSchema,
  variantId: IdSchema,
  onEnter: ActionSchema,
});

export const PanelContentSchema = z.object({
  type: z.enum(panelContentTypes),
  staticContents: z.array(StaticContentSchema),
  variantContents: z.array(VariantContentSchema),
});
