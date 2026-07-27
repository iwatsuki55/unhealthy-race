export default function AppLoading() {
  return (
    <main
      className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="space-y-6">
        <div className="h-4 w-24 rounded-md bg-muted" />
        <div className="h-9 w-72 max-w-full rounded-md bg-muted" />
        <div className="grid gap-3 md:grid-cols-3">
          <div className="h-32 rounded-lg border border-border bg-card" />
          <div className="h-32 rounded-lg border border-border bg-card" />
          <div className="h-32 rounded-lg border border-border bg-card" />
        </div>
      </div>
    </main>
  );
}
