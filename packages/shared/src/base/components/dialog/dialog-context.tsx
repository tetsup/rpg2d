import { createContext, useState, useContext, type Dispatch, type SetStateAction, type ReactNode } from 'react';
import { DialogLayout } from './dialog-layout';

type DialogContext = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

type DialogProviderProps = {
  children: ReactNode;
  title: string;
  content: ReactNode;
};

const context = createContext<DialogContext>({ open: false, setOpen: () => {} });

export function useDialogContext() {
  return useContext(context);
}

export function DialogProvider({ children, title, content }: DialogProviderProps) {
  const [open, setOpen] = useState(false);
  return (
    <context.Provider
      value={{
        open,
        setOpen,
      }}
    >
      {children}
      <DialogLayout
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        title={title}
        content={content}
      ></DialogLayout>
    </context.Provider>
  );
}
