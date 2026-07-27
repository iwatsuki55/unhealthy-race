export default function TodayLoading() {
  return (
    <div className="space-y-8" aria-live="polite" aria-busy="true">
      <div className="grid gap-4">
        <div className="h-4 w-20 rounded-md bg-muted" />
        <div className="h-9 w-72 max-w-full rounded-md bg-muted" />
        <div className="h-5 w-48 max-w-full rounded-md bg-muted" />
      </div>
      <div className="h-56 rounded-lg border border-border bg-card" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="h-24 rounded-lg border border-border bg-card" />
        <div className="h-24 rounded-lg border border-border bg-card" />
        <div className="h-24 rounded-lg border border-border bg-card" />
        <div className="h-24 rounded-lg border border-border bg-card" />
      </div>
    </div>
  );
}
