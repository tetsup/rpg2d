import { ActivityIcon } from 'lucide-react';
import { ResourceType } from '@sharedTypes/resource/common';

type ResourceIconProps = { type: ResourceType };

export function ResourceIcon({ type }: ResourceIconProps) {
  switch (type) {
    case 'action':
      return <ActivityIcon />;
  }
}
