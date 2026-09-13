import { DialogLayout } from '@base/components/dialog/dialog-layout';
import { SearchResult } from '@base/components/search/search-result';
import { SearchResultItem } from '@base/components/search/search-result-item';

type ConstantItem<T> = {
  value: T;
  label: string;
};

type ConstantSelectDialogProps<T> = {
  open: boolean;
  onChange: (value: T) => void;
  onClose: () => void;
  title: string;
  renderItem: (item: ConstantItem<T>) => React.ReactNode;
  values: ConstantItem<T>[];
  itemSize: 'full' | 'sm' | 'md' | 'lg';
};

export function ConstantSelectDialog({
  open,
  onChange,
  onClose,
  title,
  values,
  renderItem,
  itemSize,
}: ConstantSelectDialogProps<any>) {
  return (
    <DialogLayout
      open={open}
      onClose={onClose}
      title={title}
      content={
        <SearchResult size={itemSize}>
          {values.map((item) => (
            <SearchResultItem key={item.value} onClick={() => onChange(item.value)}>
              {renderItem(item)}
            </SearchResultItem>
          ))}
        </SearchResult>
      }
    />
  );
}
