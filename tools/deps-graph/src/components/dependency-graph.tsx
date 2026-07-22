import { useCallback, useMemo, useState, useEffect } from 'react';
import { Background, Controls, ReactFlow, useReactFlow, type Node, type NodeMouseHandler } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useDependencyGraph } from '../hooks/dependency-graph';
import { useGraphLayout, type GraphLayout } from '../hooks/graph-layout';
import { useGraphFileFilter } from '../hooks/file-filter';
import type { GraphFilter, GraphGrouping } from '../lib/graph-types';
import { GraphNode } from './graph-node';
import { GraphControls } from './graph-controls';
import { FileFilterSidebar } from './sidebar';
import dependencyGraphJson from '../deps-graph.json';

const nodeTypes = {
  dependency: GraphNode,
};

export function DependencyGraph() {
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);
  const [layout, setLayout] = useState<GraphLayout>('dagre-horizontal');
  const [grouping, setGrouping] = useState<GraphGrouping>({ type: 'file' });
  const [includeTypeOnly, setIncludeTypeOnly] = useState(true);
  const [showFileFilter, setShowFileFilter] = useState(true);

  const { fitView } = useReactFlow();

  const filter = useMemo<GraphFilter>(() => {
    if (focusNodeId === null) return { type: 'none' };

    return { type: 'focus', nodeId: focusNodeId };
  }, [focusNodeId]);

  const fileFilter = useGraphFileFilter({
    nodes: dependencyGraphJson.nodes,
  });

  const { nodes, edges } = useDependencyGraph({
    rawGraph: dependencyGraphJson,
    includeTypeOnly,
    grouping,
    filter,
    fileFilter: fileFilter.filter,
  });

  const { nodes: layoutNodes, edges: layoutEdges } = useGraphLayout({
    nodes,
    edges,
    layout,
  });

  const handleNodeClick = useCallback<NodeMouseHandler<Node>>((_, node) => {
    setFocusNodeId(node.id);
  }, []);

  const handlePaneClick = useCallback(() => {
    setFocusNodeId(null);
  }, []);

  useEffect(() => {
    fitView({
      padding: 0.2,
      duration: 300,
    });
  }, [nodes, edges, fitView]);

  return (
    <div className="flex h-full">
      <div className="relative flex-1">
        <ReactFlow
          fitView
          minZoom={0.1}
          maxZoom={3}
          nodes={layoutNodes}
          edges={layoutEdges}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
        >
          <Background />
          <Controls />

          <div className="absolute left-4 top-4 z-10 flex gap-2">
            <GraphControls
              layout={layout}
              grouping={grouping}
              includeTypeOnly={includeTypeOnly}
              onLayoutChange={setLayout}
              onGroupingChange={setGrouping}
              onIncludeTypeOnlyChange={setIncludeTypeOnly}
            />
            <button
              className="rounded-md border bg-background px-3 py-2 text-sm shadow-sm"
              onClick={() => {
                setShowFileFilter((value) => !value);
              }}
            >
              {showFileFilter ? 'Hide Filter' : 'Show Filter'}
            </button>
          </div>
        </ReactFlow>
      </div>
      <div className={['transition-all duration-200', showFileFilter ? 'w-72' : 'w-0', 'overflow-hidden'].join(' ')}>
        <FileFilterSidebar
          {...fileFilter}
          onClose={() => {
            setShowFileFilter(false);
          }}
        />
      </div>
    </div>
  );
}
