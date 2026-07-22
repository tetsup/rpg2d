export type DependencyGraph = {
  nodes: string[];
  edges: DependencyGraphEdge[];
};

export type DependencyGraphEdge = {
  from: string;
  to: string;
  typeOnly: boolean;
};

export type GraphNode = {
  id: string;
  label: string;
  path: string;
  sources: string[];
};

export type GraphEdge = {
  from: string;
  to: string;
  typeOnly: boolean;
};

export type GraphViewModel = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type GraphGrouping =
  | {
      type: 'file';
    }
  | {
      type: 'directory';
      depth: number;
    };

export type GraphFilter =
  | {
      type: 'none';
    }
  | {
      type: 'focus';
      nodeId: string;
    };

export type GraphFileFilter = {
  repositories: string[];
  suffixes: string[];
  searchText: string;
};
