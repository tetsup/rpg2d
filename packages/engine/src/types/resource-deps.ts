import type { Action } from '@engine/resource/domain/action';
import type { Tile } from '@engine/resource/domain/tile';
import type { Entity } from '@engine/resource/domain/entity';
import type { Font } from '@engine/resource/domain/panel/font';
import type { Color } from '@engine/resource/domain/panel/color';
import type { PanelSkin } from '@engine/resource/domain/panel/panel-skin';
import type { Skin } from '@engine/resource/domain/skin';
import { Texture } from '@engine/resource/domain/texture';

export type ActionDeps = {};
export type EntityDeps = (
  | {
      visual: 'skin';
      skin: Skin;
    }
  | {
      visual: 'texture';
      texture: Texture;
    }
  | { visual: 'none' }
) & {
  actions: { trigger: string; action: Action }[];
};
export type FieldDeps = {
  tiles: Map<string, Tile>;
  entities: Map<string, Entity>;
};
export type FontDeps = {};
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
export type PanelDeps = { skin: PanelSkin };
export type PlayerDeps = {
  initialSkin: Skin;
};
export type SkinDeps = { textures: { left: Texture; right: Texture; up: Texture; down: Texture } };
export type TextureDeps = {};
export type TileDeps = { texture: Texture; actions: Record<string, Action> };

export type ResourceDeps<Name> = Name extends 'action'
  ? ActionDeps
  : Name extends 'entity'
    ? EntityDeps
    : Name extends 'field'
      ? FieldDeps
      : Name extends 'font'
        ? FontDeps
        : Name extends 'panel'
          ? PanelDeps
          : Name extends 'panel-skin'
            ? PanelSkinDeps
            : Name extends 'player'
              ? PlayerDeps
              : Name extends 'skin'
                ? SkinDeps
                : Name extends 'texture'
                  ? TextureDeps
                  : Name extends 'tile'
                    ? TileDeps
                    : never;
