type VerticalStackerProps = {
  size?: 'xs' | 'sm';
  children: React.ReactNode;
};

export function VerticalStacker({ size = 'sm', children }: VerticalStackerProps) {
  return <div className={`space-y-${size === 'sm' ? 4 : 2} gap-${size === 'sm' ? 2 : 1}`}>{children}</div>;
}
