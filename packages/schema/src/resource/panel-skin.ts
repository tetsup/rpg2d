import { IdSchema, ResourceSchemaBase } from './common/base';
import { ColorSchema } from './common/image';

export const PanelSkinSchema = ResourceSchemaBase('panel-skin', {
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
