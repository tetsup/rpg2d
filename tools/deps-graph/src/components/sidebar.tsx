import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import type { RepositoryOption, SuffixOption } from '../hooks/file-filter';
import type { GraphFileFilter } from '../lib/graph-types';

type FileFilterSidebarProps = {
  filter: GraphFileFilter;
  repositories: RepositoryOption[];
  suffixes: SuffixOption[];
  toggleRepository: (repository: string) => void;
  toggleSuffix: (suffix: string) => void;
  setSearchText: (value: string) => void;
  clear: () => void;
  onClose: () => void;
};

export function FileFilterSidebar({
  filter,
  repositories,
  suffixes,
  toggleRepository,
  toggleSuffix,
  setSearchText,
  clear,
  onClose,
}: FileFilterSidebarProps) {
  return (
    <aside className="flex h-full w-72 flex-col gap-4 border-r bg-background p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">File Filter</h2>

        <Button size="sm" variant="outline" onClick={onClose}>
          &gt;&gt;
        </Button>
        <Button size="sm" variant="outline" onClick={clear}>
          Clear
        </Button>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium">Search</label>

        <Input
          value={filter.searchText}
          placeholder="Search files..."
          onChange={(event) => {
            setSearchText(event.target.value);
          }}
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-medium">Repository</h3>

        <div className="max-h-64 space-y-2 overflow-auto">
          {repositories.map((repository) => (
            <label key={repository.value} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={filter.repositories.includes(repository.value)}
                onCheckedChange={() => {
                  toggleRepository(repository.value);
                }}
              />

              <span className="flex-1 truncate">{repository.value}</span>

              <span className="text-xs text-muted-foreground">{repository.count}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-medium">Suffix</h3>

        <div className="max-h-64 space-y-2 overflow-auto">
          {suffixes.map((suffix) => (
            <label key={suffix.value} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={filter.suffixes.includes(suffix.value)}
                onCheckedChange={() => {
                  toggleSuffix(suffix.value);
                }}
              />

              <span className="flex-1 truncate">{suffix.value}</span>

              <span className="text-xs text-muted-foreground">{suffix.count}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
