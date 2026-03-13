import { useState, useRef } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import { Progress } from "@/shared/ui/progress";
import {
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
  Video,
  CloudUpload,
  X,
} from "lucide-react";
import { useVideoUpload } from "../hooks/useVideoUpload";
import { toast } from "sonner";

interface VideoUploaderProps {
  productCourseId: number;
  topicId: number;
  nextOrder: number;
  onSuccess: () => void;
}

export default function VideoUploader({
  productCourseId,
  topicId,
  nextOrder,
  onSuccess,
}: VideoUploaderProps) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [order, setOrder] = useState(nextOrder);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { state, progress, error, upload, reset } = useVideoUpload({
    productCourseId,
    topicId,
    onSuccess,
  });

  const isDisabled = state !== "idle" && state !== "error";

  const applyFile = (selected: File | null) => {
    if (selected && !selected.type.startsWith("video/")) {
      toast.error("Please select a valid video file.");
      return;
    }
    setFile(selected);
    if (selected && !title) {
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

  const handleUpload = () => {
    if (!file || !title.trim()) return;
    upload(file, title.trim(), order, isFreePreview);
  };

  /*  Complete state  */
  if (state === "complete") {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <div className="text-center">
          <h3 className="text-base font-semibold">Upload Complete</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Video lesson added successfully.
          </p>
        </div>
        <Button onClick={reset} variant="outline" size="sm">
          Upload Another
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="videoTitle" className="text-sm font-medium">
          Video Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="videoTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter video title"
          disabled={isDisabled}
        />
      </div>

      {/* Order */}
      <div className="space-y-1.5">
        <Label htmlFor="videoOrder" className="text-sm font-medium">
          Lesson Order <span className="text-destructive">*</span>
        </Label>
        <Input
          id="videoOrder"
          type="number"
          min={1}
          value={order}
          onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
          disabled={isDisabled}
          className="w-28"
        />
      </div>

      {/* Drop zone */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">
          Video File <span className="text-destructive">*</span>
        </Label>

        {/* Hidden input  triggered programmatically */}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          aria-label="Upload video file"
          className="hidden"
          onChange={handleFileChange}
          disabled={isDisabled}
        />

        {file ? (
          /* Selected file card */
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
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                title="Remove selected file"
                className="shrink-0 w-7 h-7 rounded-full hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          /* Drop area  entire rectangle is clickable */
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
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? "bg-primary/10" : "bg-muted"}`}
            >
              <CloudUpload
                className={`h-6 w-6 transition-colors ${isDragging ? "text-primary" : "text-muted-foreground"}`}
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

      {/* Free preview toggle */}
      <div className="flex items-center gap-2.5 rounded-xl border bg-muted/30 px-4 py-3">
        <Checkbox
          id="freePreview"
          checked={isFreePreview}
          onCheckedChange={(checked) => setIsFreePreview(checked === true)}
          disabled={isDisabled}
        />
        <div>
          <Label
            htmlFor="freePreview"
            className="cursor-pointer text-sm font-medium"
          >
            Free Preview
          </Label>
          <p className="text-xs text-muted-foreground">
            Accessible without enrollment
          </p>
        </div>
      </div>

      {/* Progress */}
      {state === "uploading" && (
        <div className="space-y-2 rounded-xl border bg-muted/30 px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">
              Uploading video
            </span>
            <span className="font-semibold tabular-nums">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {(state === "creating" || state === "saving") && (
        <div className="flex items-center gap-2.5 text-sm text-muted-foreground rounded-xl border bg-muted/30 px-4 py-3">
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          {state === "creating" ? "Creating video entry" : "Saving lesson"}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2.5 text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-xl">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Submit */}
      <Button
        onClick={handleUpload}
        disabled={!file || !title.trim() || isDisabled}
        className="w-full cursor-pointer"
        size="lg"
      >
        {state === "idle" || state === "error" ? (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Upload Video
          </>
        ) : (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing
          </>
        )}
      </Button>
    </div>
  );
}
