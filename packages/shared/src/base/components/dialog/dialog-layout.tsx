import type { ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

type DialogLayoutProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  content: ReactNode;
};

export function DialogLayout({ open, onClose, title, content }: DialogLayoutProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        onClose();
      }}
    >
      <DialogContent
        className="
            @container
            p-4
            gap-4
            overflow-hidden
            translate-y-0
            top-1/2
            -translate-y-1/2
          "
      >
        <DialogHeader className="p-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
