type ControlFieldProps = {
  label: string;
  hint?: string;
  children: React.ReactNode;
};

export function ControlField({ label, hint, children }: ControlFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
