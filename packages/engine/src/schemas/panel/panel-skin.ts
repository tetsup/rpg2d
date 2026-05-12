import z from 'zod';
import type { Texture } from '@/resource/domain/texture';
import type { Font } from '@/resource/domain/panel/font';
import type { Color } from '@/resource/domain/panel/color';
import { ColorSchema, IdSchema } from '../common';

export const PanelSkinSchema = z.object({
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

export type PanelSkinData = z.infer<typeof PanelSkinSchema>;

export type PanelSkinDeps = {
  plane: Texture;
  top: Texture;
  bottom: Texture;
  left: Texture;
  right: Texture;
  topLeft: Texture;
  topRight: Texture;
  bottomLeft: Texture;
  bottomRight: Texture;
  defaultFont: Font;
  defaultTextColor: Color;
};
