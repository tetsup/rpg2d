import { useEffect, useRef, type ReactNode } from 'react';
import { ActivityIcon } from 'lucide-react';
import type { Database, ResourceDocument } from '@sharedTypes/database/collection';
import type { FilterMap } from '@sharedTypes/database/filter';

type ImageData = ResourceDocument<'image'>['data'];

function ImageResourceThumbnail({ image }: { image: ImageData }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { width, height } = image.size;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.createImageData(width, height);
    image.pixels.forEach((row, y) => {
      row.split(/\s+/).forEach((token, x) => {
        const rgba = image.palette[token];
        if (!rgba) return;
        const i = (y * width + x) * 4;
        imageData.data[i] = rgba[0];
        imageData.data[i + 1] = rgba[1];
        imageData.data[i + 2] = rgba[2];
        imageData.data[i + 3] = rgba[3];
      });
    });
    ctx.putImageData(imageData, 0, 0);
  }, [image, width, height]);

  return (
    <canvas ref={ref} width={width} height={height} className="size-full [image-rendering:pixelated]" />
  );
}

function renderResourceThumbnail(item: Database['resources']): ReactNode | null {
  switch (item.type) {
    case 'image':
      return <ImageResourceThumbnail image={item.data} />;
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
