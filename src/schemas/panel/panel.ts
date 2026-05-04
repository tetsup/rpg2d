import z from 'zod';
import type { PanelSkin } from '@/resource/domain/panel/panel-skin';
import { IdSchema, PositionSchema, ResourceSchemaBase, SizeSchema } from '../common';
import { PanelContentSchema } from './panel-content';

const panelAnchors = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;

export const PanelSchema = ResourceSchemaBase('panel', {
  skin: IdSchema,
  layout: z.discriminatedUnion('anchorType', [
    z.object({
      anchorType: z.enum(['screen', 'parent']),
      anchor: z.enum(panelAnchors),
      pos: PositionSchema,
      size: SizeSchema,
    }),
    z.object({
      anchorType: z.literal('specific'),
      anchorRef: IdSchema,
      anchor: z.enum(panelAnchors),
      pos: PositionSchema,
      size: SizeSchema,
    }),
  ]),
  content: PanelContentSchema,
});

export type PanelData = z.infer<typeof PanelSchema>;

export type PanelDeps = { skin: PanelSkin };
