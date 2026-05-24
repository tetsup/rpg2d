import { Input } from '@editor/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@editor/components/ui/select';
import { resources } from '@schema/resource/common/base';
import type { ResourceType } from '@sharedTypes/resource/common';

type SearchBarProps = {
  setQuery: (query: string) => void;
  setType: (type?: ResourceType) => void;
  compact: boolean;
};

export const SearchBar = ({ setQuery, setType, compact }: SearchBarProps) => (
  <div
    className={[
      'transition-all',
      'duration-200',
      compact ? 'h-12 flex-row items-center gap-2' : 'h-24 flex-col gap-3',
    ].join(' ')}
  >
    <Input className="flex-1" placeholder="search..." onChange={(e) => setQuery(e.target.value)} />
    <Select onValueChange={(v: ResourceType | null) => setType(v ?? undefined)}>
      <SelectTrigger className={compact ? 'w-32' : 'w-full'}>
        <SelectValue placeholder="Resource Type" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value={null}>(all)</SelectItem>
          {resources.map((type) => (
            <SelectItem value={type}>{type}</SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
);
