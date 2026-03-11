import { FileText, Download, ExternalLink, FileType } from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { LessonMaterialContent } from "../types";

interface MaterialLessonViewerProps {
  material: LessonMaterialContent;
}

/** Returns the file extension (lowercase) from a URL, e.g. "pdf", "docx" */
function getExtension(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const dot = pathname.lastIndexOf(".");
    if (dot === -1) return "";
    return pathname.slice(dot + 1).toLowerCase();
  } catch {
    return "";
  }
}

export default function MaterialLessonViewer({
  material,
}: MaterialLessonViewerProps) {
  const { contentUrl, title } = material;
  const ext = getExtension(contentUrl);
  const isPdf = ext === "pdf";

  if (isPdf) {
    return (
      <div
        className="w-full rounded-xl overflow-hidden border border-border shadow-lg"
        style={{ height: "75vh" }}
      >
        <iframe
          src={contentUrl}
          title={title}
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  // Non-PDF: show a friendly download / open card
  const extLabel = ext ? ext.toUpperCase() : "File";

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 px-4">
      <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center">
        <FileType className="h-10 w-10 text-amber-600" />
      </div>

      <div className="text-center space-y-1.5">
        <p className="text-lg font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">
          {extLabel} document · click below to open or download
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild size="lg" className="gap-2 cursor-pointer">
          <a href={contentUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            Open File
          </a>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="gap-2 cursor-pointer"
        >
          <a href={contentUrl} download>
            <Download className="h-4 w-4" />
            Download
          </a>
        </Button>
      </div>
    </div>
  );
}
