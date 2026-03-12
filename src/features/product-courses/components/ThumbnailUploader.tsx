import { useState, useRef, useEffect, useCallback } from "react";
import {
  CloudUpload,
  ImageIcon,
  Loader2,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { toast } from "sonner";
import { uploadPermanentFile } from "../api";

interface ThumbnailUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

const MIN_ZOOM = 1.0;
const MAX_ZOOM = 4.0;
const ZOOM_STEP = 0.1;

/** Returns the scale factor to make the image cover the container (object-fit: cover) */
function coverScale(nW: number, nH: number, cW: number, cH: number) {
  return Math.max(cW / nW, cH / nH);
}

export default function ThumbnailUploader({
  value,
  onChange,
  label = "Thumbnail",
}: ThumbnailUploaderProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [natSize, setNatSize] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1.0);
  // Pan offset in display-space pixels (0,0 = centred)
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingImg, setIsDraggingImg] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragOrigin = useRef({ clientX: 0, clientY: 0, panX: 0, panY: 0 });

  // Revoke blob URL on unmount / change
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const applyFile = (f: File) => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(URL.createObjectURL(f));
    setFile(f);
    setNatSize({ w: 0, h: 0 });
    setPan({ x: 0, y: 0 });
    setZoom(1.0);
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) applyFile(f);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) applyFile(f);
  };

  // ── Drag-to-pan ───────────────────────────────────────────

  /** Clamp pan so the image never shows a gap.
   *  Pass `z` explicitly when calling from inside a zoom setter to avoid stale closure. */
  const clampPan = useCallback(
    (x: number, y: number, z?: number): { x: number; y: number } => {
      if (!containerRef.current || !natSize.w) return { x, y };
      const zFactor = z !== undefined ? z : zoom;
      const cW = containerRef.current.offsetWidth;
      const cH = containerRef.current.offsetHeight;
      const sc = coverScale(natSize.w, natSize.h, cW, cH) * zFactor;
      const maxX = Math.max(0, (natSize.w * sc - cW) / 2);
      const maxY = Math.max(0, (natSize.h * sc - cH) / 2);
      return {
        x: Math.max(-maxX, Math.min(maxX, x)),
        y: Math.max(-maxY, Math.min(maxY, y)),
      };
    },
    [natSize, zoom],
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragOrigin.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    setIsDraggingImg(true);
  };

  useEffect(() => {
    if (!isDraggingImg) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - dragOrigin.current.clientX;
      const dy = e.clientY - dragOrigin.current.clientY;
      setPan(
        clampPan(dragOrigin.current.panX + dx, dragOrigin.current.panY + dy),
      );
    };
    const onUp = () => setIsDraggingImg(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDraggingImg, clampPan]);

  // ── Zoom ──────────────────────────────────────────────────

  const applyZoom = useCallback(
    (newZoom: number) => {
      const clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
      setZoom(clamped);
      setPan((prev) => clampPan(prev.x, prev.y, clamped));
    },
    [clampPan],
  );

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom((prev) => {
        const next = Math.max(
          MIN_ZOOM,
          Math.min(MAX_ZOOM, Math.round((prev + delta) * 10) / 10),
        );
        setPan((p) => clampPan(p.x, p.y, next));
        return next;
      });
    },
    [clampPan],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !blobUrl) return;
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [handleWheel, blobUrl]);

  // ── Upload ────────────────────────────────────────────────

  const handleUpload = async () => {
    if (
      !file ||
      !blobUrl ||
      !containerRef.current ||
      !natSize.w ||
      !imgRef.current
    )
      return;
    setIsUploading(true);
    try {
      const cW = containerRef.current.offsetWidth;
      const cH = containerRef.current.offsetHeight;
      const sc = coverScale(natSize.w, natSize.h, cW, cH) * zoom;
      const dW = natSize.w * sc;
      const dH = natSize.h * sc;

      // Crop bounds in natural pixels
      const cropX = (dW / 2 - cW / 2 - pan.x) / sc;
      const cropY = (dH / 2 - cH / 2 - pan.y) / sc;
      const cropW = cW / sc;
      const cropH = cH / sc;

      // Draw to 1280×720 (YouTube standard)
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");
      ctx.drawImage(
        imgRef.current,
        cropX,
        cropY,
        cropW,
        cropH,
        0,
        0,
        1280,
        720,
      );

      const blob = await new Promise<Blob>((res, rej) =>
        canvas.toBlob(
          (b) => (b ? res(b) : rej(new Error("toBlob failed"))),
          "image/jpeg",
          0.92,
        ),
      );

      const croppedFile = new File(
        [blob],
        file.name.replace(/\.[^.]+$/, "-thumb.jpg"),
        { type: "image/jpeg" },
      );

      const result = await uploadPermanentFile(croppedFile, "thumbnail");
      onChange(result.fileUrl);
      toast.success("Thumbnail uploaded!");
      setFile(null);
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
    } catch (err) {
      console.error(err);
      toast.error("Thumbnail upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDiscard = () => {
    setFile(null);
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Image cover style ─────────────────────────────────────
  // Simulate object-fit: cover with absolute positioning + pan translate
  const imgCoverStyle: React.CSSProperties =
    natSize.w > 0 && natSize.h > 0
      ? natSize.w / natSize.h > 16 / 9
        ? { height: "100%", width: "auto" } // wider → fit height
        : { width: "100%", height: "auto" } // taller → fit width
      : { width: "100%", height: "auto" };

  // ── Render ────────────────────────────────────────────────

  const hasPending = !!blobUrl;
  const hasUploaded = !!value && !hasPending;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {hasPending ? (
        /* ── Crop preview ── */
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Drag to reposition · Scroll or use ± buttons to zoom · 16:9 ratio
          </p>
          <div
            ref={containerRef}
            className={[
              "relative overflow-hidden rounded-xl border-2 select-none",
              isDraggingImg
                ? "cursor-grabbing border-primary/60"
                : "cursor-grab border-primary/30 hover:border-primary/50",
            ].join(" ")}
            style={{ aspectRatio: "16 / 9" }}
            onMouseDown={handleMouseDown}
          >
            {/* Rule-of-thirds grid */}
            <div className="absolute inset-0 pointer-events-none z-10 grid grid-cols-3 grid-rows-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-white/15" />
              ))}
            </div>

            {/* Zoom controls overlay */}
            <div
              className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-black/55 backdrop-blur-sm rounded-lg px-2 py-1 pointer-events-auto"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => applyZoom(zoom - ZOOM_STEP)}
                disabled={zoom <= MIN_ZOOM}
                className="text-white disabled:opacity-40 hover:text-primary transition-colors p-0.5 cursor-pointer"
                aria-label="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-white text-xs w-10 text-center font-mono select-none">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => applyZoom(zoom + ZOOM_STEP)}
                disabled={zoom >= MAX_ZOOM}
                className="text-white disabled:opacity-40 hover:text-primary transition-colors p-0.5 cursor-pointer"
                aria-label="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>

            <img
              ref={imgRef}
              src={blobUrl!}
              alt="Crop preview"
              draggable={false}
              className="absolute pointer-events-none"
              style={{
                top: "50%",
                left: "50%",
                transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
                maxWidth: "none",
                ...imgCoverStyle,
              }}
              onLoad={(e) => {
                const el = e.currentTarget;
                setNatSize({ w: el.naturalWidth, h: el.naturalHeight });
              }}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleUpload}
              disabled={isUploading || !natSize.w}
              className="cursor-pointer"
            >
              {isUploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <Upload className="h-3.5 w-3.5 mr-1.5" />
              )}
              {isUploading ? "Uploading…" : "Crop & Upload"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleDiscard}
              disabled={isUploading}
              className="cursor-pointer"
            >
              <X className="h-3.5 w-3.5 mr-1.5" />
              Cancel
            </Button>
          </div>
        </div>
      ) : hasUploaded ? (
        /* ── Existing thumbnail ── */
        <div className="space-y-2">
          <div
            className="relative overflow-hidden rounded-xl border group"
            style={{ aspectRatio: "16 / 9" }}
          >
            <img
              src={value}
              alt="Course thumbnail"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
                Change
              </Button>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="cursor-pointer gap-1.5"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            Change Thumbnail
          </Button>
        </div>
      ) : (
        /* ── Drop zone ── */
        <div
          className={[
            "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-all cursor-pointer select-none",
            isDraggingFile
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/30",
          ].join(" ")}
          style={{ aspectRatio: "16 / 9" }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingFile(true);
          }}
          onDragLeave={() => setIsDraggingFile(false)}
          onDrop={handleFileDrop}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDraggingFile ? "bg-primary/10" : "bg-muted"}`}
          >
            <CloudUpload
              className={`h-6 w-6 ${isDraggingFile ? "text-primary" : "text-muted-foreground"}`}
            />
          </div>
          <div className="text-center px-6">
            <p className="text-sm font-medium">
              {isDraggingFile ? "Drop image here" : "Click or drag & drop"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              JPG, PNG, WebP — 16:9 YouTube ratio
            </p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        aria-label="Upload thumbnail image"
        onChange={handleFilePick}
      />
    </div>
  );
}
