import { useMemo } from 'react';
import dagre from '@dagrejs/dagre';
import type { Edge, Node } from '@xyflow/react';

export type GraphLayout = 'none' | 'dagre-vertical' | 'dagre-horizontal';

export type UseGraphLayoutProps = {
  nodes: Node[];
  edges: Edge[];
  layout: GraphLayout;
};

export type UseGraphLayoutResult = {
  nodes: Node[];
  edges: Edge[];
};

const NODE_SIZE = {
  width: 320,
  height: 64,
};

export function useGraphLayout({ nodes, edges, layout }: UseGraphLayoutProps): UseGraphLayoutResult {
  const layoutedNodes = useMemo(() => {
    if (layout === 'none') {
      return nodes;
    }

    const graph = new dagre.graphlib.Graph();

    graph.setDefaultEdgeLabel(() => ({}));

    graph.setGraph({
      rankdir: layout === 'dagre-horizontal' ? 'LR' : 'TB',
      ranksep: 120,
      nodesep: 30,
      marginx: 40,
      marginy: 40,
    });

    for (const node of nodes) {
      graph.setNode(node.id, {
        width: NODE_SIZE.width,
        height: NODE_SIZE.height,
      });
    }

    for (const edge of edges) {
      graph.setEdge(edge.source, edge.target);
    }

    dagre.layout(graph);

    return nodes.map((node) => {
      const position = graph.node(node.id);

      return {
        ...node,
        sourcePosition: layout === 'dagre-horizontal' ? 'right' : 'bottom',
        targetPosition: layout === 'dagre-horizontal' ? 'left' : 'top',
        position: {
          x: position.x - NODE_SIZE.width / 2,
          y: position.y - NODE_SIZE.height / 2,
        },
      } as Node;
    });
  }, [nodes, edges, layout]);

  return {
    nodes: layoutedNodes,
    edges,
  };
}
