import { createContext, useContext, type ReactNode } from 'react';
import { type FieldName, useController } from 'react-hook-form';

export function toFieldControlId(name: string): string {
  return `field--${name.replace(/\./g, '--')}`;
}

const FieldControlIdContext = createContext<string | null>(null);

export function useFieldControlId(): string {
  const controlId = useContext(FieldControlIdContext);
  if (controlId == null) {
    throw new Error('useFieldControlId must be used within FieldWrapper');
  }
  return controlId;
}

type FieldWrapperProps<T extends FieldName<any>> = {
  name: T;
  label: string;
  hint?: string;
  labelVariant?: 'default' | 'group';
  children: ReactNode;
};

function FieldFooter({ error, hint }: { error?: { message?: string }; hint?: string }) {
  if (error) {
    return <p className="text-xs text-destructive">{error.message}</p>;
  }
  if (hint) {
    return <p className="text-xs text-muted-foreground">{hint}</p>;
  }
  return null;
}

export function FieldWrapper({
  name,
  label,
  hint,
  labelVariant = 'default',
  children,
}: FieldWrapperProps<any>) {
  const {
    fieldState: { error },
  } = useController({ name });
  const controlId = toFieldControlId(name);

  const body = (
    <FieldControlIdContext.Provider value={controlId}>
      {children}
      <FieldFooter error={error} hint={hint} />
    </FieldControlIdContext.Provider>
  );

  if (labelVariant === 'group') {
    return (
      <fieldset className="m-0 space-y-2 border-0 p-0">
        <legend className="text-sm font-medium">{label}</legend>
        {body}
      </fieldset>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor={controlId} className="text-sm font-medium">
        {label}
      </label>
      {body}
    </div>
  );
}
