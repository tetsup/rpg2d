export type InlineSubFieldProps = {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
};

export function InlineSubField({ label, htmlFor, children }: InlineSubFieldProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={htmlFor} className="w-4 shrink-0 text-sm">
        {label}
      </label>
      <div className="flex-1">{children}</div>
    </div>
  );
}
