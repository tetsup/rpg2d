import { useEffect, useRef, type ReactNode } from 'react';
import { useQueries } from '@tanstack/react-query';
import { ActivityIcon } from 'lucide-react';
import type { Database, ResourceDocument } from '@sharedTypes/database/collection';
import type { FilterMap } from '@sharedTypes/database/filter';
import { documentKey, getDocumentById } from '@editor/hooks/api/by-id';
import { useResolvedDocument } from '@editor/hooks/api/resolved-document';
import {
  drawCompositeImages,
  getCompositeCanvasSize,
  getTextureCompositeImageIds,
  type ImagePixelData,
} from '@editor/lib/pixel-render';

type TextureData = ResourceDocument<'texture'>['data'];
type SkinData = ResourceDocument<'skin'>['data'];
type PlayerData = ResourceDocument<'player'>['data'];
type EntityData = ResourceDocument<'entity'>['data'];

function CompositeImageThumbnail({ images }: { images: ImagePixelData[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { width, height } = getCompositeCanvasSize(images);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || images.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawCompositeImages(ctx, images, width, height);
  }, [images, width, height]);

  if (images.length === 0) return null;

  return (
    <canvas ref={ref} width={width} height={height} className="size-full [image-rendering:pixelated]" />
  );
}

function ResolvedCompositeImageThumbnail({ imageIds }: { imageIds: string[] }) {
  const results = useQueries({
    queries: imageIds.map((id) => ({
      queryKey: documentKey('resources', id),
      queryFn: () => getDocumentById('resources', id),
      enabled: Boolean(id),
    })),
  });

  const images = imageIds.flatMap((id, index) => {
    const resource = results[index]?.data;
    if (resource?.type !== 'image') return [];
    return [resource.data];
  });

  if (imageIds.length > 0 && images.length === 0) return null;

  return <CompositeImageThumbnail images={images} />;
}

function TextureResourceThumbnail({ texture }: { texture: TextureData }) {
  const imageIds = getTextureCompositeImageIds(texture);
  if (imageIds.length === 0) return null;
  return <ResolvedCompositeImageThumbnail imageIds={imageIds} />;
}

function ResolvedTextureThumbnail({ textureId }: { textureId: string }) {
  const texture = useResolvedDocument('resources', textureId);
  if (!texture || texture.type !== 'texture') return null;
  return <TextureResourceThumbnail texture={texture.data} />;
}

function SkinResourceThumbnail({ skin }: { skin: SkinData }) {
  const texture = useResolvedDocument('resources', skin.textures.down);
  if (!texture || texture.type !== 'texture') return null;
  const imageIds = getTextureCompositeImageIds(texture.data);
  if (imageIds.length === 0) return null;
  return <ResolvedCompositeImageThumbnail imageIds={imageIds} />;
}

function ResolvedSkinThumbnail({ skinId }: { skinId: string }) {
  const skin = useResolvedDocument('resources', skinId);
  if (!skin || skin.type !== 'skin') return null;
  return <SkinResourceThumbnail skin={skin.data} />;
}

function PlayerResourceThumbnail({ player }: { player: PlayerData }) {
  return <ResolvedSkinThumbnail skinId={player.initialSkin} />;
}

function EntityResourceThumbnail({ entity }: { entity: EntityData }) {
  if (entity.visual === 'skin') {
    return <ResolvedSkinThumbnail skinId={entity.skin} />;
  }
  if (entity.visual === 'texture') {
    return <ResolvedTextureThumbnail textureId={entity.texture} />;
  }
  return null;
}

function renderResourceThumbnail(item: Database['resources']): ReactNode | null {
  switch (item.type) {
    case 'image':
      return <CompositeImageThumbnail images={[item.data]} />;
    case 'texture':
      return <TextureResourceThumbnail texture={item.data} />;
    case 'skin':
      return <SkinResourceThumbnail skin={item.data} />;
    case 'player':
      return <PlayerResourceThumbnail player={item.data} />;
    case 'entity':
      return <EntityResourceThumbnail entity={item.data} />;
    case 'action':
      return <ActivityIcon className="size-4" />;
    default:
      return null;
  }
}

export function renderDocumentThumbnail<K extends keyof FilterMap>(
  collectionName: K,
  item: Database[K]
): ReactNode | null {
  if (collectionName === 'resources') {
    return renderResourceThumbnail(item as Database['resources']);
  }
  return null;
}
