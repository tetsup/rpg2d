import z from 'zod';
import { IdSchema } from '../common';

export const PanelSkinSchema = z.object({
  plane: IdSchema,
  top: IdSchema,
  bottom: IdSchema,
  left: IdSchema,
  right: IdSchema,
  topLeft: IdSchema,
  topRight: IdSchema,
  bottomLeft: IdSchema,
  bottomRigth: IdSchema,
});
