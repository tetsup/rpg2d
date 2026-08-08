type PaletteLayoutProps = { children: React.ReactNode };

export function PaletteLayout({ children }: PaletteLayoutProps) {
  return <div className="flex flex-wrap gap-1">{children}</div>;
}
