export function Backdrop({ open }: { open: boolean }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-white border-t-transparent" />
    </div>
  );
}
