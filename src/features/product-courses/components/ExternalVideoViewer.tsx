import { ExternalLink } from "lucide-react";
import { Button } from "@/shared/ui/button";

/**
 * Convert a YouTube / Vimeo watch URL to the embeddable iframe src.
 * Returns null when the URL can't be converted to a known embed format.
 */
function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);

    // ── YouTube ────────────────────────────────────────────
    // youtu.be/VIDEO_ID[?si=...]
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1).split("?")[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }

    if (u.hostname === "www.youtube.com" || u.hostname === "youtube.com") {
      // Already an embed URL
      if (u.pathname.startsWith("/embed/")) return url;
      // youtube.com/watch?v=VIDEO_ID
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v");
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
      // youtube.com/shorts/VIDEO_ID
      const shortsMatch = u.pathname.match(/^\/shorts\/([A-Za-z0-9_-]+)/);
      if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
    }

    // ── Vimeo ──────────────────────────────────────────────
    if (u.hostname === "vimeo.com") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
    }
    if (u.hostname === "player.vimeo.com") return url;

    // Unknown — can't embed
    return null;
  } catch {
    return null;
  }
}

interface ExternalVideoViewerProps {
  directUrl: string;
}

const ExternalVideoViewer = ({ directUrl }: ExternalVideoViewerProps) => {
  const embedUrl = toEmbedUrl(directUrl);

  if (!embedUrl) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center space-y-4">
        <p className="text-muted-foreground text-sm">
          This video cannot be embedded. Click below to open it in a new tab.
        </p>
        <Button
          variant="outline"
          className="cursor-pointer gap-2"
          onClick={() =>
            window.open(directUrl, "_blank", "noopener,noreferrer")
          }
        >
          <ExternalLink className="h-4 w-4" />
          Open Video
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden bg-black aspect-video w-full">
      <iframe
        src={embedUrl}
        title="External Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
};

export default ExternalVideoViewer;
