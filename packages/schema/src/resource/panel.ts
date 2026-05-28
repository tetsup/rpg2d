import z from 'zod';
import { IdSchema, IdSchemaFromType } from './common/base';
import { PositionSchema, SizeSchema } from './common/coordinate';
import { PanelContentSchema } from './panel/panel-content';

const panelAnchors = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;

export const PanelSchema = z.object({
  id: IdSchemaFromType('panel'),
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
