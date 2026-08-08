import { Children, isValidElement, ReactElement, ReactNode } from 'react';
import { cn } from '@base/lib/utils';

export type AttachmentPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

type AttachmentContainerProps = {
  content: ReactNode;
  children?: ReactNode;
  className?: string;
};

type AttachmentProps = {
  position: AttachmentPosition;
  children: ReactNode;
};

export function Attachment({ children }: AttachmentProps) {
  return <>{children}</>;
}

type AttachmentElement = ReactElement<AttachmentProps>;

export function AttachmentContainer({ content, children, className }: AttachmentContainerProps) {
  const groups = new Map<AttachmentPosition, ReactNode[]>();

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type !== Attachment) return;

    const { position, children: attachment } = (child as AttachmentElement).props;

    const list = groups.get(position) ?? [];
    list.push(attachment);
    groups.set(position, list);
  });

  return (
    <div className={cn('relative', className)}>
      {content}

      {[...groups.entries()].map(([position, items]) => (
        <div key={position} className={positionClass(position)}>
          {items.map((item, index) => (
            <div key={index}>{item}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

function positionClass(position: AttachmentPosition) {
  switch (position) {
    case 'top-left':
      return 'absolute top-1 left-1 flex gap-1';

    case 'top-center':
      return 'absolute top-1 left-1/2 -translate-x-1/2 flex gap-1';

    case 'top-right':
      return 'absolute top-1 right-1 flex gap-1';

    case 'center-left':
      return 'absolute left-1 top-1/2 -translate-y-1/2 flex gap-1';

    case 'center':
      return 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1';

    case 'center-right':
      return 'absolute right-1 top-1/2 -translate-y-1/2 flex gap-1';

    case 'bottom-left':
      return 'absolute bottom-1 left-1 flex gap-1';

    case 'bottom-center':
      return 'absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1';

    case 'bottom-right':
      return 'absolute bottom-1 right-1 flex gap-1';
  }
}
