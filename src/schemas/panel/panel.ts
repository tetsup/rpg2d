import z from 'zod';
import { IdSchema, PositionSchema, ResourceSchemaBase, SizeSchema } from '../common';
import { PanelContentSchema } from './panel-content';

const panelAnchors = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;

const panelAnchorRefs = ['screen', 'parent', 'specific'] as const;

export const PanelSchema = ResourceSchemaBase('panel', {
  skin: IdSchema,
  layout: z.object({
    anchorRef: z.enum(panelAnchorRefs),
    anchor: z.enum(panelAnchors),
    pos: PositionSchema,
    size: SizeSchema,
  }),
  content: PanelContentSchema,
});

export type PanelData = z.infer<typeof PanelSchema>;
