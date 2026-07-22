import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import type { GraphGrouping } from '../lib/graph-types';
import type { GraphLayout } from '../hooks/graph-layout';

type GraphControlsProps = {
  layout: GraphLayout;
  grouping: GraphGrouping;
  includeTypeOnly: boolean;

  onLayoutChange: (layout: GraphLayout) => void;
  onGroupingChange: (grouping: GraphGrouping) => void;
  onIncludeTypeOnlyChange: (value: boolean) => void;
};

export function GraphControls({
  layout,
  grouping,
  includeTypeOnly,
  onLayoutChange,
  onGroupingChange,
  onIncludeTypeOnlyChange,
}: GraphControlsProps) {
  return (
    <div className="flex flex-wrap items-end gap-4 rounded-md border bg-background p-4">
      <div className="flex min-w-44 flex-col gap-2">
        <Label>Layout</Label>

        <Select value={layout} onValueChange={(value) => onLayoutChange(value as GraphLayout)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="dagre-vertical">Dagre Vertical</SelectItem>
            <SelectItem value="dagre-horizontal">Dagre Horizontal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex min-w-40 flex-col gap-2">
        <Label>Grouping</Label>

        <Select
          value={grouping.type}
          onValueChange={(value) => {
            if (value === 'file') {
              onGroupingChange({
                type: 'file',
              });
            } else {
              onGroupingChange({
                type: 'directory',
                depth: grouping.type === 'directory' ? grouping.depth : 1,
              });
            }
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="file">File</SelectItem>
            <SelectItem value="directory">Directory</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex w-24 flex-col gap-2">
        <Label>Depth</Label>

        <Input
          type="number"
          min={1}
          disabled={grouping.type !== 'directory'}
          value={grouping.type === 'directory' ? grouping.depth : 1}
          onChange={(event) => {
            if (grouping.type !== 'directory') {
              return;
            }

            const depth = Math.max(1, Number(event.target.value) || 1);

            onGroupingChange({
              type: 'directory',
              depth,
            });
          }}
        />
      </div>

      <div className="flex items-center gap-2 pb-2">
        <Checkbox checked={includeTypeOnly} onCheckedChange={(checked) => onIncludeTypeOnlyChange(checked === true)} />

        <Label>Show type-only imports</Label>
      </div>
    </div>
  );
}
