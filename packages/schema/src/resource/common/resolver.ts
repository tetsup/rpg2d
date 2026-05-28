import type { ResourceType } from '@sharedTypes/resource/common';
import { ActionSchema } from '@schema/resource/action';
import { EntitySchema } from '../entity';
import { FieldSchema } from '../field';
import { FontSchema } from '../font';
import { ImageSchema } from '../image';
import { ManifestSchema } from '../manifest';
import { PanelSchema } from '../panel';
import { PanelSkinSchema } from '../panel-skin';
import { PlayerSchema } from '../player';
import { SkinSchema } from '../skin';
import { TextureSchema } from '../texture';
import { TileSchema } from '../tile';
import z from 'zod';

export const resolveResourceSchema = (type: ResourceType) => {
  switch (type) {
    case 'action':
      return ActionSchema;
    case 'entity':
      return EntitySchema;
    case 'field':
      return FieldSchema;
    case 'font':
      return FontSchema;
    case 'image':
      return ImageSchema;
    case 'manifest':
      return ManifestSchema;
    case 'panel':
      return PanelSchema;
    case 'panel-skin':
      return PanelSkinSchema;
    case 'player':
      return PlayerSchema;
    case 'skin':
      return SkinSchema;
    case 'texture':
      return TextureSchema;
    case 'tile':
      return TileSchema;
  }
};

export const ResourceSchemaUnion = z.union([
  ActionSchema,
  EntitySchema,
  FieldSchema,
  FontSchema,
  ImageSchema,
  ManifestSchema,
  PanelSchema,
  PanelSkinSchema,
  PlayerSchema,
  SkinSchema,
  TextureSchema,
  TileSchema,
]);
