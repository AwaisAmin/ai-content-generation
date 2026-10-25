import Skeleton from "@/components/ui/Skeleton";

/**
 * Workspace layout: history strip on top, prompt panel on the left and the
 * results feed on the right. The real sections replace these placeholders
 * in the following steps.
 */
export default function WorkspaceShell({ title }) {
  return (
    <div className="mx-auto flex w-full max-w-[1680px] flex-1 flex-col gap-4 px-4 pb-6 md:px-8">
      <h1 className="sr-only">{title}</h1>

      <section aria-label="Recent history">
        <Skeleton className="h-24 w-full md:h-[88px]" />
      </section>

      <div className="grid flex-1 gap-6 md:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside aria-label="Create">
          <Skeleton className="h-[460px] rounded-panel" />
        </aside>

        <section aria-label="Generations" className="space-y-6">
          {[0, 1].map((row) => (
            <div key={row} className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)]">
              <Skeleton className="h-40" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[0, 1, 2, 3].map((cell) => (
                  <Skeleton key={cell} className="aspect-[3/4]" />
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
