// ============================================================
// Re-upload Video Modal
// Lets an instructor replace a failed / corrupted video file
// for an existing video lesson without deleting and re-creating it.
// ============================================================

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Progress } from "@/shared/ui/progress";
import {
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
  Video,
  CloudUpload,
  X,
  RefreshCw,
} from "lucide-react";
import { useReuploadVideo } from "../hooks/useVideoUpload";

interface ReuploadVideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonId: number;
  /** Pre-fills the title field with the current lesson title */
  currentTitle: string;
  onSuccess: () => void;
}

export default function ReuploadVideoModal({
  open,
  onOpenChange,
  lessonId,
  currentTitle,
  onSuccess,
}: ReuploadVideoModalProps) {
  const [title, setTitle] = useState(currentTitle);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSuccess = () => {
    onSuccess();
    // Small delay so the user sees the "complete" state briefly
    setTimeout(() => {
      handleClose();
    }, 1500);
  };

  const { state, progress, error, reupload, reset } = useReuploadVideo({
    onSuccess: handleSuccess,
  });

  const isDisabled = state !== "idle" && state !== "error";

  const applyFile = (selected: File | null) => {
    setFile(selected);
    if (selected && !title.trim()) {
      setTitle(selected.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    applyFile(e.target.files?.[0] ?? null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (isDisabled) return;
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type.startsWith("video/")) {
      applyFile(dropped);
    }
  };

  const handleReupload = () => {
    if (!file || !title.trim()) return;
    reupload(lessonId, file, title.trim());
  };

  const handleClose = () => {
    if (isDisabled) return;
    reset();
    setFile(null);
    setTitle(currentTitle);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleClose();
        else onOpenChange(true);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <RefreshCw className="h-4 w-4 text-primary" />
            </div>
            Re-upload Video
          </DialogTitle>
        </DialogHeader>

        {/* ── Complete state ─────────────────────────────── */}
        {state === "complete" ? (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-7 w-7 text-green-500" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold">Re-upload Complete</p>
              <p className="text-sm text-muted-foreground mt-1">
                The new video has been uploaded successfully.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5 py-2">
            {/* Info banner */}
            <div className="flex items-start gap-3 rounded-xl border bg-amber-500/5 border-amber-500/20 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>
                Use this to replace a video that failed to encode or was
                corrupted. The lesson record stays intact — only the video file
                is replaced.
              </p>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="reuploadTitle" className="text-sm font-medium">
                Video Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="reuploadTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title"
                disabled={isDisabled}
              />
            </div>

            {/* File drop zone */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                New Video File <span className="text-destructive">*</span>
              </Label>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                aria-label="Upload replacement video file"
                className="hidden"
                onChange={handleFileChange}
                disabled={isDisabled}
              />

              {file ? (
                <div className="flex items-center gap-3 rounded-xl border bg-muted/40 px-4 py-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Video className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                  {!isDisabled && (
                    <button
                      onClick={() => {
                        setFile(null);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                      title="Remove selected file"
                      className="shrink-0 w-7 h-7 rounded-full hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => !isDisabled && fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (!isDisabled) setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={[
                    "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-all select-none",
                    isDisabled
                      ? "opacity-50 cursor-not-allowed bg-muted/20"
                      : isDragging
                        ? "border-primary bg-primary/5 scale-[1.01] cursor-copy"
                        : "border-border hover:border-primary/50 hover:bg-muted/40 cursor-pointer",
                  ].join(" ")}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                      isDragging ? "bg-primary/10" : "bg-muted"
                    }`}
                  >
                    <CloudUpload
                      className={`h-6 w-6 transition-colors ${
                        isDragging ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      {isDragging
                        ? "Drop video here"
                        : "Click or drag & drop a video"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      MP4, MOV, AVI, MKV, WebM
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Upload progress */}
            {state === "uploading" && (
              <div className="space-y-2 rounded-xl border bg-muted/30 px-4 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium">
                    Uploading video
                  </span>
                  <span className="font-semibold tabular-nums">
                    {progress}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {state === "creating" && (
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground rounded-xl border bg-muted/30 px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                Preparing upload credentials…
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-xl">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="flex-1">{error}</span>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {state !== "complete" && (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isDisabled}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReupload}
                disabled={!file || !title.trim() || isDisabled}
                className="cursor-pointer gap-2"
              >
                {state === "uploading" || state === "creating" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {state === "error" ? "Retry Upload" : "Upload Video"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
