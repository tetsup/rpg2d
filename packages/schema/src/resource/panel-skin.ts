import z from 'zod';
import { IdSchema, IdSchemaFromType } from './common/base';
import { ColorSchema } from './common/image';

export const PanelSkinSchema = z.object({
  id: IdSchemaFromType('panel-skin'),
  plane: IdSchema,
  top: IdSchema,
  bottom: IdSchema,
  left: IdSchema,
  right: IdSchema,
  topLeft: IdSchema,
  topRight: IdSchema,
  bottomLeft: IdSchema,
  bottomRight: IdSchema,
  defaultFont: IdSchema,
  defaultTextColor: ColorSchema,
});
