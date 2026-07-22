import { Handle, type Node, Position, type NodeProps } from '@xyflow/react';

type DependencyGraphNodeData = Node<{
  label: string;
  path: string;
  sources: string[];
  incoming?: number;
  outgoing?: number;
}>;

export function GraphNode({ data, selected }: NodeProps<DependencyGraphNodeData>) {
  return (
    <div
      className={[
        'h-16 w-80 rounded-md border bg-background shadow-sm',
        'flex items-center gap-3 px-3',
        selected ? 'border-primary ring-2 ring-primary/20' : 'border-border',
      ].join(' ')}
    >
      <Handle type="target" position={Position.Left} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{data.label}</div>
        <div className="truncate text-xs text-muted-foreground">{data.path}</div>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-[11px] text-muted-foreground">
        <span title="incoming dependencies">↑ {data.incoming ?? 0}</span>
        <span title="outgoing dependencies">↓ {data.outgoing ?? data.sources.length}</span>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
