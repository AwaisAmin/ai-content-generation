import GenerationFeed from "@/components/feed/GenerationFeed";
import HistoryStrip from "@/components/history/HistoryStrip";
import PromptPanel from "@/components/prompt/PromptPanel";
import { WorkspaceProvider } from "@/components/workspace/WorkspaceProvider";

/**
 * Workspace layout: history strip on top, prompt panel on the left and the
 * results feed on the right.
 *
 * @param feedType     "image" | "video" to filter the feed; omit for all.
 * @param defaultType  Which mode the prompt panel opens in.
 */
export default function WorkspaceShell({ title, feedType, defaultType = "image" }) {
  return (
    <WorkspaceProvider feedType={feedType}>
      {/* Mobile: extra bottom room so the last row clears the composer bar. */}
      <div className="mx-auto flex w-full max-w-[1680px] flex-1 flex-col gap-4 px-4 pb-24 md:px-8 md:pb-6">
        <h1 className="sr-only">{title}</h1>

        {/* Desktop: the strip floats over the feed as it scrolls, like the mockup. */}
        <div className="z-30 md:sticky md:top-20">
          <HistoryStrip />
        </div>

        <div className="grid flex-1 md:grid-cols-[280px_minmax(0,1fr)] md:gap-6 xl:grid-cols-[300px_minmax(0,1fr)] 2xl:grid-cols-[320px_minmax(0,1fr)]">
          {/* md+: sticks below header (5rem) + history strip (92px) + gap and
              scrolls internally if Advance and Styles are both expanded.
              Mobile: its content is fixed (composer bar + sheet). */}
          <aside className="scrollbar-thin md:sticky md:top-[calc(5rem+92px+1rem)] md:max-h-[calc(100dvh-5rem-92px-2rem)] md:self-start md:overflow-y-auto">
            <PromptPanel defaultType={defaultType} />
          </aside>

          <section aria-label="Generations" className="@container/feed min-w-0">
            <GenerationFeed />
          </section>
        </div>
      </div>
    </WorkspaceProvider>
  );
}
