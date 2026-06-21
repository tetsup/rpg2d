import { type FieldName, useController } from 'react-hook-form';

type FieldWrapperProps<T extends FieldName<any>> = {
  name: T;
  label: string;
  hint?: string;
  children: React.ReactNode;
};

export function FieldWrapper({ name, label, hint, children }: FieldWrapperProps<any>) {
  const {
    fieldState: { error },
  } = useController({ name });

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error.message}</p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
