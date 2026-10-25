import { Play } from "lucide-react";
import FadeInImage from "@/components/ui/FadeInImage";

const LABEL_MAX_LENGTH = 100;

function truncate(text, max) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/** One history entry: jumps to its generation in the feed. */
export default function HistoryThumbnail({ item }) {
  const { cover } = item;
  const isVideo = item.type === "video";
  const label = `${isVideo ? "Video" : "Image"}: ${truncate(item.prompt, LABEL_MAX_LENGTH)}`;

  return (
    <li className="shrink-0 snap-start">
      <a
        href={`#generation-${item.id}`}
        aria-label={label}
        title={label}
        className="group/thumb relative block size-16 overflow-hidden rounded-xl bg-surface-sunken transition-[translate,box-shadow] duration-300 ease-(--ease-spring) hover:-translate-y-0.5 hover:shadow-lifted md:size-[68px]"
      >
        {isVideo ? (
          <video
            src={`${cover.src}#t=0.5`}
            muted
            playsInline
            preload="metadata"
            tabIndex={-1}
            aria-hidden="true"
            className="size-full object-cover transition-transform duration-500 ease-(--ease-out-soft) group-hover/thumb:scale-110"
          />
        ) : (
          <FadeInImage
            src={cover.src}
            alt=""
            width={68}
            height={68}
            sizes="68px"
            quality={60}
            className="size-full object-cover group-hover/thumb:scale-110"
          />
        )}

        {isVideo && (
          <span className="absolute right-1 bottom-1 flex size-4 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
            <Play className="size-2 fill-current" aria-hidden="true" />
          </span>
        )}
      </a>
    </li>
  );
}
