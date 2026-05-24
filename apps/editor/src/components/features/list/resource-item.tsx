import { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions } from '../../ui/item';
import { Button } from '../../ui/button';
import { ResourceIcon } from './resource-icon';
import { ResourceSummary } from '@editor/types/resources';

type ResourceItemProps = {
  summary: ResourceSummary;
};

export const ResourceItem = ({ summary }: ResourceItemProps) => {
  return (
    <Item>
      <ItemMedia variant="icon">
        <ResourceIcon type={summary.type} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{summary.name}</ItemTitle>
        <ItemDescription>{summary.description}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button>Action</Button>
      </ItemActions>
    </Item>
  );
};
