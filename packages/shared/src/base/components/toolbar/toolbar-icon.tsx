export type ToolbarIconProps = {
  icon: React.ComponentType<{ className?: string }>;
};

export function ToolbarIcon({ icon: Icon }: ToolbarIconProps) {
  return <Icon className="size-[var(--toolbar-icon-size)]" />;
}
