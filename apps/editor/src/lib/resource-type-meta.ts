import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  AppWindow,
  Bot,
  Image,
  Layers,
  LayoutGrid,
  Map,
  PanelsTopLeft,
  PersonStanding,
  Type,
  User,
} from 'lucide-react';
import type { ResourceType } from '@sharedTypes/resource/common';

export type BrowsableResourceType = Exclude<ResourceType, 'manifest'>;

export const graphicsResourceTypes = ['image', 'texture', 'skin'] as const satisfies readonly BrowsableResourceType[];

export type GraphicsResourceType = (typeof graphicsResourceTypes)[number];

export const formCreatableResourceTypes = ['tile'] as const satisfies readonly BrowsableResourceType[];

export type FormCreatableResourceType = (typeof formCreatableResourceTypes)[number];

export const creatableResourceTypes = [
  ...graphicsResourceTypes,
  ...formCreatableResourceTypes,
] as const satisfies readonly BrowsableResourceType[];

export type CreatableResourceType = (typeof creatableResourceTypes)[number];

/** Resource types whose document picker should show image thumbnails. */
export const thumbnailPickerResourceTypes = graphicsResourceTypes;

export type ThumbnailPickerResourceType = GraphicsResourceType;

type ResourceTypeMeta = {
  label: string;
  description: string;
  icon: LucideIcon;
};

type ResourceTypeGroup = {
  id: string;
  title: string;
  description: string;
  types: readonly BrowsableResourceType[];
};

export const resourceTypeGroups: readonly ResourceTypeGroup[] = [
  {
    id: 'field',
    title: 'フィールド',
    description: 'マップを歩き回るフィールドモードで使う、マップ・登場人物・イベントを作ります。',
    types: ['field', 'player', 'entity', 'action'],
  },
  {
    id: 'graphics',
    title: 'グラフィック',
    description: 'キャラクターや地形など、画面上に表示される見た目の素材を作ります。',
    types: ['image', 'texture', 'skin', 'tile'],
  },
  {
    id: 'custom-ui',
    title: 'カスタムUI',
    description: 'メッセージ・メニュー・ステータスなど、画面に重ねて表示するUI部品を作ります。',
    types: ['panel-skin', 'font', 'panel'],
  },
] as const;

export const resourceTypeMeta: Record<BrowsableResourceType, ResourceTypeMeta> = {
  field: {
    label: 'マップ',
    description: '1枚のマップレイアウト',
    icon: Map,
  },
  player: {
    label: 'プレイヤー',
    description: '操作する主人公の定義',
    icon: User,
  },
  entity: {
    label: 'エンティティ',
    description: 'マップ上のNPC・オブジェクト',
    icon: Bot,
  },
  action: {
    label: 'アクション',
    description: '会話や演出などのイベント処理',
    icon: Activity,
  },
  image: {
    label: '画像',
    description: 'ピクセル単位の原画像',
    icon: Image,
  },
  texture: {
    label: 'テクスチャ',
    description: '画像を重ねた見た目・アニメーション',
    icon: Layers,
  },
  skin: {
    label: 'スキン',
    description: '上下左右のキャラクター見た目',
    icon: PersonStanding,
  },
  tile: {
    label: 'タイル',
    description: 'マップ1マス分の地形・床',
    icon: LayoutGrid,
  },
  'panel-skin': {
    label: 'パネルスキン',
    description: 'メッセージ枠・ウィンドウの装飾',
    icon: PanelsTopLeft,
  },
  font: {
    label: 'フォント',
    description: 'ゲーム内テキスト用フォント',
    icon: Type,
  },
  panel: {
    label: 'パネル',
    description: 'メッセージ・メニュー・ステータスなどの画面配置',
    icon: AppWindow,
  },
};

const browsableResourceTypes = resourceTypeGroups.flatMap((group) => group.types);

export function isBrowsableResourceType(type: string): type is BrowsableResourceType {
  return browsableResourceTypes.includes(type as BrowsableResourceType);
}

export function isGraphicsResourceType(type: string): type is GraphicsResourceType {
  return graphicsResourceTypes.includes(type as GraphicsResourceType);
}

export function isFormCreatableResourceType(type: string): type is FormCreatableResourceType {
  return formCreatableResourceTypes.includes(type as FormCreatableResourceType);
}

export function isCreatableResourceType(type: string): type is CreatableResourceType {
  return creatableResourceTypes.includes(type as CreatableResourceType);
}

export function isThumbnailPickerResourceType(type: string): type is ThumbnailPickerResourceType {
  return thumbnailPickerResourceTypes.includes(type as ThumbnailPickerResourceType);
}

export function findResourceTypeGroup(type: BrowsableResourceType): ResourceTypeGroup | undefined {
  return resourceTypeGroups.find((group) => group.types.includes(type));
}
