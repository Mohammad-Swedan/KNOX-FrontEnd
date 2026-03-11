import { useState, useRef } from "react";
import { AlertCircle, CloudUpload, Loader2, Video, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Progress } from "@/shared/ui/progress";
import { toast } from "sonner";
import { createVideo, uploadVideoToBunny } from "../api";
import type { VideoUploadState } from "../types";

interface TrialVideoUploaderFieldProps {
  /** Must be provided (edit mode) to enable the upload flow */
  courseId?: number;
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function TrialVideoUploaderField({
  courseId,
  value,
  onChange,
  label = "Trial / Preview Video",
}: TrialVideoUploaderFieldProps) {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<VideoUploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDisabled = state !== "idle" && state !== "error";

  const reset = () => {
    setState("idle");
    setFile(null);
    setProgress(0);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isDisabled) return;
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("video/")) setFile(f);
  };

  const handleUpload = async () => {
    if (!file || !courseId) return;
    setState("creating");
    setError(null);
    setProgress(0);

    try {
      // Step 1 — create a Bunny video entry (no lesson created — this is for the trial only)
      const result = await createVideo({
        productCourseId: courseId,
        title: file.name.replace(/\.[^.]+$/, ""),
      });

      // Step 2 — upload raw file to Bunny
      setState("uploading");
      await uploadVideoToBunny(
        file,
        result.uploadUrl,
        result.libraryApiKey,
        (pct) => setProgress(Math.round(pct)),
      );

      // Step 3 — build permanent embed URL from libraryId + videoGuid
      const embedUrl = `https://iframe.mediadelivery.net/embed/${result.libraryId}/${result.videoGuid}`;
      onChange(embedUrl);
      setState("complete");
      toast.success("Trial video uploaded!");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Upload failed");
      setState("error");
    }
  };

  // ── No courseId (create mode) ──────────────────────────────
  if (!courseId) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="rounded-xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Save the course first — you can upload a trial video from the edit
          page.
        </div>
      </div>
    );
  }

  // ── Video already set OR upload complete ───────────────────
  if (value && (state === "idle" || state === "complete")) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Video className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Trial video set</p>
            <p className="text-xs text-muted-foreground truncate">{value}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 cursor-pointer"
            onClick={() => {
              onChange("");
              reset();
            }}
            title="Remove trial video"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ── Upload UI ──────────────────────────────────────────────
  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {file ? (
        /* File selected — show details + upload button */
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <Video className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
            {!isDisabled && (
              <button
                onClick={reset}
                title="Remove selected file"
                className="shrink-0 w-7 h-7 rounded-full hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Progress */}
          {state === "uploading" && (
            <div className="space-y-2 rounded-xl border bg-muted/30 px-4 py-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">
                  Uploading to Bunny
                </span>
                <span className="font-semibold tabular-nums">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {state === "creating" && (
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground rounded-xl border bg-muted/30 px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              Preparing upload…
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2.5 text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-xl">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <Button
            type="button"
            size="sm"
            onClick={handleUpload}
            disabled={isDisabled}
            className="cursor-pointer gap-1.5"
          >
            {isDisabled ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CloudUpload className="h-3.5 w-3.5" />
            )}
            {isDisabled ? "Uploading…" : "Upload Trial Video"}
          </Button>
        </div>
      ) : (
        /* Drop zone */
        <div
          className={[
            "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-all cursor-pointer select-none py-8",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/30",
          ].join(" ")}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleFileDrop}
        >
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center ${isDragging ? "bg-primary/10" : "bg-muted"}`}
          >
            <CloudUpload
              className={`h-5 w-5 ${isDragging ? "text-primary" : "text-muted-foreground"}`}
            />
          </div>
          <div className="text-center px-6">
            <p className="text-sm font-medium">
              {isDragging ? "Drop video here" : "Click or drag & drop"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              MP4, MOV, AVI, MKV, WebM
            </p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        aria-label="Upload trial video"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            setFile(f);
            setState("idle");
            setError(null);
          }
        }}
        disabled={isDisabled}
      />
    </div>
  );
}
