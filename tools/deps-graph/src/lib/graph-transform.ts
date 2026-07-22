import type {
  DependencyGraph,
  GraphEdge,
  GraphFilter,
  GraphGrouping,
  GraphNode,
  GraphFileFilter,
  GraphViewModel,
} from './graph-types';

function fileName(path: string): string {
  const index = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
  return index >= 0 ? path.slice(index + 1) : path;
}

function directoryPath(path: string, depth: number): string {
  const parts = path.split('/');
  return parts.length <= depth ? path : parts.slice(0, depth).join('/');
}

function directoryName(path: string): string {
  const index = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
  return index >= 0 ? path.slice(index + 1) : path;
}

export function filterTypeOnly(graph: DependencyGraph, includeTypeOnly: boolean): DependencyGraph {
  if (includeTypeOnly) return graph;

  return {
    nodes: graph.nodes,
    edges: graph.edges.filter((edge) => !edge.typeOnly),
  };
}

export function groupNodes(graph: DependencyGraph, grouping: GraphGrouping): GraphViewModel {
  if (grouping.type === 'file')
    return {
      nodes: graph.nodes.map<GraphNode>((path) => ({
        id: path,
        label: fileName(path),
        path,
        sources: [path],
      })),
      edges: graph.edges.map<GraphEdge>((edge) => ({
        from: edge.from,
        to: edge.to,
        typeOnly: edge.typeOnly,
      })),
    };

  const nodeMap = new Map<string, GraphNode>();
  const edgeMap = new Map<string, GraphEdge>();
  const groupOf = (path: string) => directoryPath(path, grouping.depth);

  for (const path of graph.nodes) {
    const id = groupOf(path);
    const node = nodeMap.get(id);
    if (node) {
      node.sources.push(path);
      continue;
    }

    nodeMap.set(id, {
      id,
      label: directoryName(id),
      path: id,
      sources: [path],
    });
  }

  for (const edge of graph.edges) {
    const from = groupOf(edge.from);
    const to = groupOf(edge.to);
    if (from === to) continue;

    const key = `${from}->${to}`;
    const existing = edgeMap.get(key);
    if (existing) {
      existing.typeOnly &&= edge.typeOnly;
      continue;
    }

    edgeMap.set(key, {
      from,
      to,
      typeOnly: edge.typeOnly,
    });
  }

  return {
    nodes: [...nodeMap.values()],
    edges: [...edgeMap.values()],
  };
}

export function filterGraph(graph: GraphViewModel, filter: GraphFilter): GraphViewModel {
  if (filter.type === 'none') return graph;
  const visibleNodes = new Set<string>([filter.nodeId]);
  const visibleEdges = graph.edges.filter((edge) => {
    const visible = edge.from === filter.nodeId || edge.to === filter.nodeId;
    if (visible) {
      visibleNodes.add(edge.from);
      visibleNodes.add(edge.to);
    }
    return visible;
  });

  return {
    nodes: graph.nodes.filter((node) => visibleNodes.has(node.id)),
    edges: visibleEdges,
  };
}

export function filterFile(graph: DependencyGraph, filter: GraphFileFilter): DependencyGraph {
  const hasRepositoryFilter = filter.repositories.length > 0;
  const hasSuffixFilter = filter.suffixes.length > 0;
  const hasSearchFilter = filter.searchText.trim().length > 0;
  if (!hasRepositoryFilter && !hasSuffixFilter && !hasSearchFilter) return graph;

  const keyword = filter.searchText.toLowerCase();
  const visibleNodes = graph.nodes.filter((path) => {
    if (hasRepositoryFilter) {
      const repository = getRepository(path);
      if (!repository || !filter.repositories.includes(repository)) return false;
    }

    if (hasSuffixFilter) {
      const suffix = getSuffix(path);
      if (!suffix || !filter.suffixes.includes(suffix)) return false;
    }

    if (hasSearchFilter && !path.toLowerCase().includes(keyword)) return false;

    return true;
  });

  const visibleNodeIds = new Set(visibleNodes);

  return {
    nodes: visibleNodes,
    edges: graph.edges.filter((edge) => visibleNodeIds.has(edge.from) && visibleNodeIds.has(edge.to)),
  };
}

function getRepository(path: string): string | undefined {
  const match = path.match(/(?:^|\/)(apps\/[^/]+|packages\/[^/]+)/);
  return match?.[1];
}

function getSuffix(path: string): string | undefined {
  const filename = path.split('/').at(-1);
  if (!filename) return undefined;

  const index = filename.indexOf('.');
  if (index < 0) return undefined;

  return filename.slice(index);
}

export function createGraph(options: {
  rawGraph: DependencyGraph;
  includeTypeOnly: boolean;
  grouping: GraphGrouping;
  filter: GraphFilter;
  fileFilter: GraphFileFilter;
}): GraphViewModel {
  const fileFiltered = filterFile(options.rawGraph, options.fileFilter);
  const filtered = filterTypeOnly(fileFiltered, options.includeTypeOnly);
  const grouped = groupNodes(filtered, options.grouping);
  return filterGraph(grouped, options.filter);
}
