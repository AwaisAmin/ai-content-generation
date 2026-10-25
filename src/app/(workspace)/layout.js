import AppHeader from "@/components/layout/AppHeader";
import PrimaryNav from "@/components/layout/PrimaryNav";

export default function WorkspaceLayout({ children }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lifted"
      >
        Skip to content
      </a>

      <AppHeader />

      <main id="main" className="flex flex-1 flex-col pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile: tools move to a thumb-reachable bottom dock. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <PrimaryNav variant="dock" />
      </div>
    </>
  );
}
