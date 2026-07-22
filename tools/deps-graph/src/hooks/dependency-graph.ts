import { useMemo } from 'react';
import type { Edge, Node } from '@xyflow/react';
import { createGraph } from '../lib/graph-transform';
import type { DependencyGraph, GraphFilter, GraphGrouping, GraphFileFilter } from '../lib/graph-types';

export type UseDependencyGraphOptions = {
  rawGraph: DependencyGraph;
  includeTypeOnly: boolean;
  grouping: GraphGrouping;
  filter: GraphFilter;
  fileFilter: GraphFileFilter;
};

export type UseDependencyGraphResult = {
  nodes: Node[];
  edges: Edge[];
};

export function useDependencyGraph(options: UseDependencyGraphOptions): UseDependencyGraphResult {
  return useMemo(() => {
    const graph = createGraph(options);

    return {
      nodes: graph.nodes.map<Node>((node) => ({
        id: node.id,
        type: 'dependency',
        position: {
          x: 0,
          y: 0,
        },
        data: {
          label: node.label,
          path: node.path,
          sources: node.sources,
        },
      })),

      edges: graph.edges.map<Edge>((edge) => ({
        id: `${edge.from}->${edge.to}`,
        source: edge.from,
        target: edge.to,
        animated: false,
        data: {
          typeOnly: edge.typeOnly,
        },
        markerEnd: {
          type: 'arrowclosed',
        },
      })),
    };
  }, [options]);
}
