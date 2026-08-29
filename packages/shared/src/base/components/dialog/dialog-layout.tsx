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
            p-4
            gap-4
            overflow-hidden
            top-[12vh]
            translate-y-0
            sm:top-1/2
            sm:-translate-y-1/2
          "
      >
        <DialogHeader className="p-0">
          <DialogTitle>{title}</DialogTitle>
          {content}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
