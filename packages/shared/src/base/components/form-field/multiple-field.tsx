export type MultipleFieldProps = {
  label: string;
  hint?: string;
  error?: string;
  columns?: number;
  children: React.ReactNode;
};

export function MultipleField({ label, hint, error, columns = 2, children }: MultipleFieldProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{label}</legend>
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        }}
      >
        {children}
      </div>
      <div className="min-h-5">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : hint ? (
          <p className="text-sm text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    </fieldset>
  );
}
