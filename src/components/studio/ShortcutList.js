import { SHORTCUTS } from "@/config/studio";

export default function ShortcutList() {
  return (
    <dl className="divide-y divide-border px-4 py-2">
      {SHORTCUTS.map(({ keys, description }) => (
        <div key={description} className="flex items-center justify-between gap-4 py-2.5">
          <dt className="text-[13px]">{description}</dt>
          <dd className="flex shrink-0 gap-1">
            {keys.map((key) => (
              <kbd
                key={key}
                className="min-w-6 rounded-md border border-border bg-surface px-1.5 py-0.5 text-center font-sans text-[11px] font-semibold shadow-soft"
              >
                {key}
              </kbd>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}
