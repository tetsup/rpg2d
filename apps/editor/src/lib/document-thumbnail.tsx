import { useEffect, useRef, type ReactNode } from 'react';
import { useQueries } from '@tanstack/react-query';
import { ActivityIcon } from 'lucide-react';
import type { Database, ResourceDocument } from '@sharedTypes/database/collection';
import type { FilterMap } from '@sharedTypes/database/filter';
import { documentKey, getDocumentById } from '@editor/hooks/api/by-id';
import { useResolvedDocument } from '@editor/hooks/api/resolved-document';

type ImageData = ResourceDocument<'image'>['data'];
type TextureData = ResourceDocument<'texture'>['data'];
type SkinData = ResourceDocument<'skin'>['data'];
type PlayerData = ResourceDocument<'player'>['data'];
type EntityData = ResourceDocument<'entity'>['data'];

function getTextureCompositeImageIds(texture: TextureData): string[] {
  return [...texture.layers]
    .sort((a, b) => a.priority - b.priority)
    .flatMap((layer) => {
      const first = layer.images[0];
      return first ? [first] : [];
    });
}

function drawImageData(ctx: CanvasRenderingContext2D, image: ImageData, x: number, y: number) {
  const { width, height } = image.size;
  const imageData = ctx.createImageData(width, height);
  image.pixels.forEach((row, rowY) => {
    row.split(/\s+/).forEach((token, colX) => {
      const rgba = image.palette[token];
      if (!rgba) return;
      const i = (rowY * width + colX) * 4;
      imageData.data[i] = rgba[0];
      imageData.data[i + 1] = rgba[1];
      imageData.data[i + 2] = rgba[2];
      imageData.data[i + 3] = rgba[3];
    });
  });
  const layerCanvas = document.createElement('canvas');
  layerCanvas.width = width;
  layerCanvas.height = height;
  layerCanvas.getContext('2d')!.putImageData(imageData, 0, 0);
  ctx.drawImage(layerCanvas, x, y);
}

function CompositeImageThumbnail({ images }: { images: ImageData[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const width = Math.max(...images.map((image) => image.size.width));
  const height = Math.max(...images.map((image) => image.size.height));

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || images.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    for (const image of images) {
      drawImageData(ctx, image, 0, 0);
    }
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
