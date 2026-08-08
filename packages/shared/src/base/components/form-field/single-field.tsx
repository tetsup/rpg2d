export type SingleFieldProps = {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
};

export function SingleField({ label, hint, error, children }: SingleFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {children}
      <div className="min-h-5">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : hint ? (
          <p className="text-sm text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}
