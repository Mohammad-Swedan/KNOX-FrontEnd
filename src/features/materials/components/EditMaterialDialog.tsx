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
import type { MaterialItem } from "../types";
import { uploadTemporaryFile } from "../api";

interface EditMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: MaterialItem | null;
  onSubmit: (
    materialId: number,
    payload: {
      title?: string;
      contentUrl?: string;
      description?: string;
      tags?: string[];
    },
  ) => Promise<void> | void;
}

/** Extracts a display-friendly filename from a URL */
function fileNameFromUrl(url: string): string {
  try {
    return decodeURIComponent(new URL(url).pathname.split("/").pop() ?? url);
  } catch {
    return url;
  }
}

/** Inner form — remounted via `key` whenever a different material is opened. */
function EditMaterialForm({
  material,
  onClose,
  onSubmit,
}: {
  material: MaterialItem;
  onClose: () => void;
  onSubmit: EditMaterialDialogProps["onSubmit"];
}) {
  const [title, setTitle] = useState(material.title);
  const [description, setDescription] = useState(material.description ?? "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(material.tags ?? []);

  // null = keep existing file; string = newly uploaded URL
  const [newFileUrl, setNewFileUrl] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setError(null);
    setSubmitting(false);
    onClose();
  };

  // ── File upload ─────────────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploadError(null);
    setNewFileUrl(null);
    setNewFileName(null);
    setIsUploading(true);
    try {
      const result = await uploadTemporaryFile(file);
      setNewFileUrl(result.fileUrl);
      setNewFileName(result.fileName);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "File upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const clearNewFile = () => {
    setNewFileUrl(null);
    setNewFileName(null);
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
    try {
      setSubmitting(true);
      await onSubmit(material.id, {
        title: title.trim(),
        // Only send contentUrl if user uploaded a replacement
        ...(newFileUrl ? { contentUrl: newFileUrl } : {}),
        description: description.trim() || undefined,
        tags,
      });
      handleClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update material",
      );
      setSubmitting(false);
    }
  };

  const isBusy = isUploading || submitting;
  const isReplacing = newFileUrl !== null;
  const activeFileName = newFileName ?? fileNameFromUrl(material.contentUrl);

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Edit Material</DialogTitle>
        <DialogDescription>
          Update the details of this material.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="edit-mat-title">Title *</Label>
          <Input
            id="edit-mat-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Chapter 1 Notes"
            autoFocus
            disabled={isBusy}
          />
        </div>

        {/* File — current + optional replacement */}
        <div className="space-y-1.5">
          <Label>File</Label>

          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
            <FileIcon className="h-4 w-4 shrink-0 text-primary" />
            <span className="flex-1 truncate text-sm">
              {activeFileName}
              {isReplacing && (
                <span className="ml-1.5 text-xs text-muted-foreground">
                  (new)
                </span>
              )}
            </span>
            {isReplacing ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearNewFile}
                disabled={isBusy}
                className="text-xs"
              >
                Revert
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="text-xs"
              >
                {isUploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <Upload className="mr-1 h-3.5 w-3.5" />
                    Replace
                  </>
                )}
              </Button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            aria-label="Replace material file"
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
          <Label htmlFor="edit-mat-desc">Description (optional)</Label>
          <Textarea
            id="edit-mat-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the material"
            rows={2}
            disabled={isBusy}
          />
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <Label htmlFor="edit-mat-tags">Tags (optional)</Label>
          <div className="flex gap-2">
            <Input
              id="edit-mat-tags"
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
          Save Changes
        </Button>
      </DialogFooter>
    </form>
  );
}

export function EditMaterialDialog({
  open,
  onOpenChange,
  material,
  onSubmit,
}: EditMaterialDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {material && (
          <EditMaterialForm
            key={material.id}
            material={material}
            onClose={() => onOpenChange(false)}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default EditMaterialDialog;
