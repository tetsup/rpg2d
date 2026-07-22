import { useMemo, useState } from 'react';
import type { GraphFileFilter } from '../lib/graph-types';

export type RepositoryOption = {
  value: string;
  count: number;
};

export type SuffixOption = {
  value: string;
  count: number;
};

export type UseGraphFileFilterOptions = {
  nodes: string[];
};

export type UseGraphFileFilterResult = {
  filter: GraphFileFilter;
  filteredNodes: string[];
  repositories: RepositoryOption[];
  suffixes: SuffixOption[];
  setRepositories: (repositories: string[]) => void;
  setSuffixes: (suffixes: string[]) => void;
  setSearchText: (value: string) => void;
  toggleRepository: (repository: string) => void;
  toggleSuffix: (suffix: string) => void;
  clear: () => void;
};

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

function includesText(path: string, text: string): boolean {
  if (!text) return true;

  return path.toLowerCase().includes(text.toLowerCase());
}

export function useGraphFileFilter({ nodes }: UseGraphFileFilterOptions): UseGraphFileFilterResult {
  const [filter, setFilter] = useState<GraphFileFilter>({
    repositories: [],
    suffixes: [],
    searchText: '',
  });

  const repositories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const node of nodes) {
      const repository = getRepository(node);
      if (!repository) continue;

      counts.set(repository, (counts.get(repository) ?? 0) + 1);
    }

    return [...counts.entries()]
      .map(([value, count]) => ({
        value,
        count,
      }))
      .sort((a, b) => a.value.localeCompare(b.value));
  }, [nodes]);

  const suffixes = useMemo(() => {
    const counts = new Map<string, number>();
    for (const node of nodes) {
      const suffix = getSuffix(node);
      if (!suffix) continue;

      counts.set(suffix, (counts.get(suffix) ?? 0) + 1);
    }

    return [...counts.entries()]
      .map(([value, count]) => ({
        value,
        count,
      }))
      .sort((a, b) => a.value.localeCompare(b.value));
  }, [nodes]);

  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      const repository = getRepository(node);
      if (filter.repositories.length > 0 && (!repository || !filter.repositories.includes(repository))) return false;

      const suffix = getSuffix(node);
      if (filter.suffixes.length > 0 && (!suffix || !filter.suffixes.includes(suffix))) return false;

      return includesText(node, filter.searchText);
    });
  }, [nodes, filter]);

  function setRepositories(repositories: string[]) {
    setFilter((current) => ({
      ...current,
      repositories,
    }));
  }

  function setSuffixes(suffixes: string[]) {
    setFilter((current) => ({
      ...current,
      suffixes,
    }));
  }

  function setSearchText(searchText: string) {
    setFilter((current) => ({
      ...current,
      searchText,
    }));
  }

  function toggleRepository(repository: string) {
    setFilter((current) => ({
      ...current,
      repositories: current.repositories.includes(repository)
        ? current.repositories.filter((value) => value !== repository)
        : [...current.repositories, repository],
    }));
  }

  function toggleSuffix(suffix: string) {
    setFilter((current) => ({
      ...current,
      suffixes: current.suffixes.includes(suffix)
        ? current.suffixes.filter((value) => value !== suffix)
        : [...current.suffixes, suffix],
    }));
  }

  function clear() {
    setFilter({
      repositories: [],
      suffixes: [],
      searchText: '',
    });
  }

  return {
    filter,
    filteredNodes,
    repositories,
    suffixes,
    setRepositories,
    setSuffixes,
    setSearchText,
    toggleRepository,
    toggleSuffix,
    clear,
  };
}
