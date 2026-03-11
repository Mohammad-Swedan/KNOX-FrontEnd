import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Badge } from "@/shared/ui/badge";
import { X, Loader2, Upload, File as FileIcon } from "lucide-react";
import { uploadTemporaryFile } from "../api";

interface AddMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass a folderId if you want the material to be placed inside a folder by default */
  defaultFolderId?: number | null;
  onSubmit: (payload: {
    title: string;
    contemtUrl: string;
    folderId?: number | null;
    description?: string;
    tags?: string[];
  }) => Promise<void> | void;
}

export function AddMaterialDialog({
  open,
  onOpenChange,
  defaultFolderId,
  onSubmit,
}: AddMaterialDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setTitle("");
    setDescription("");
    setTagInput("");
    setTags([]);
    setUploadedFileUrl(null);
    setUploadedFileName(null);
    setIsUploading(false);
    setUploadError(null);
    setSubmitting(false);
    setError(null);
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  // ── File upload ─────────────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // allow same file to be re-selected
    setUploadError(null);
    setUploadedFileUrl(null);
    setUploadedFileName(null);
    setIsUploading(true);
    try {
      const result = await uploadTemporaryFile(file);
      setUploadedFileUrl(result.fileUrl);
      setUploadedFileName(result.fileName);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "File upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setUploadedFileUrl(null);
    setUploadedFileName(null);
    setUploadError(null);
  };

  // ── Tags ────────────────────────────────────────────────────────────────────
  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Please provide a title.");
      return;
    }
    if (!uploadedFileUrl) {
      setError("Please upload a file.");
      return;
    }
    try {
      setSubmitting(true);
      await onSubmit({
        title: title.trim(),
        contemtUrl: uploadedFileUrl,
        folderId: defaultFolderId ?? null,
        description: description.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add material");
      setSubmitting(false);
    }
  };

  const isBusy = isUploading || submitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Material</DialogTitle>
            <DialogDescription>
              Upload a file and fill in the details below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="mat-title">Title *</Label>
              <Input
                id="mat-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Chapter 1 Notes"
                autoFocus
                disabled={isBusy}
              />
            </div>

            {/* File upload */}
            <div className="space-y-1.5">
              <Label>File *</Label>

              {uploadedFileUrl ? (
                /* Uploaded — show filename + change button */
                <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
                  <FileIcon className="h-4 w-4 shrink-0 text-primary" />
                  <span className="flex-1 truncate text-sm">
                    {uploadedFileName}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearFile}
                    disabled={isBusy}
                    className="text-xs"
                  >
                    Change
                  </Button>
                </div>
              ) : (
                /* Drop zone */
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-muted/20 p-6 transition hover:border-primary/60 hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">
                        Uploading…
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to browse file
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        Max 10 MB
                      </p>
                    </>
                  )}
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                aria-label="Upload material file"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />

              {uploadError && (
                <p className="text-sm text-destructive">{uploadError}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="mat-desc">Description (optional)</Label>
              <Textarea
                id="mat-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the material"
                rows={2}
                disabled={isBusy}
              />
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <Label htmlFor="mat-tags">Tags (optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="mat-tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Type and press Enter"
                  disabled={isBusy}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTag}
                  disabled={isBusy}
                >
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        aria-label={`Remove tag ${tag}`}
                        onClick={() => removeTag(tag)}
                        className="rounded-full hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isBusy}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isBusy}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Material
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddMaterialDialog;
