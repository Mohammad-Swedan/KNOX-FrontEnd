import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Loader2,
  Upload,
  File as FileIcon,
  X,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Checkbox } from "@/shared/ui/checkbox";
import { Badge } from "@/shared/ui/badge";
import { toast } from "sonner";
import { useLessons, useProductCourse } from "../hooks/useProductCourses";
import { uploadTemporaryFile, createMaterial } from "@/features/materials/api";
import { addLesson } from "../api";

const AddMaterialLessonPage = () => {
  const { id, topicId: topicIdParam } = useParams<{
    id: string;
    topicId: string;
  }>();
  const navigate = useNavigate();
  const courseId = parseInt(id || "0");
  const topicId = parseInt(topicIdParam || "0");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { course, loading: courseLoading } = useProductCourse(courseId);
  const { lessons } = useLessons(courseId);

  const nextOrder =
    lessons.length > 0 ? Math.max(...lessons.map((l) => l.order)) + 1 : 1;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [order, setOrder] = useState(nextOrder);
  // Always default to false — instructor must explicitly enable free preview
  const [isFreePreview, setIsFreePreview] = useState(false);

  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploadError(null);
    setUploadedFileUrl(null);
    setUploadedFileName(null);
    setIsUploading(true);
    if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
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

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) =>
    setTags((prev) => prev.filter((t) => t !== tag));

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFileUrl || !title.trim() || !course?.academicCourseId) return;
    setSubmitting(true);
    try {
      const material = await createMaterial(course.academicCourseId, {
        title: title.trim(),
        contemtUrl: uploadedFileUrl,
        description: description.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
        folderId: null,
      });
      await addLesson(courseId, topicId, {
        title: title.trim(),
        order,
        type: 2,
        isFreePreview,
        referenceId: material.id,
      });
      toast.success("Material lesson added!");
      navigate(`/dashboard/product-courses/${id}/lessons`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add lesson");
    } finally {
      setSubmitting(false);
    }
  };

  const isBusy = isUploading || submitting || courseLoading;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-xl">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">New Material Lesson</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Upload a document and configure the lesson
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="mat-title" className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="mat-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Chapter 1 Reading"
              required
              autoFocus
              disabled={isBusy}
            />
            <p className="text-xs text-muted-foreground">
              This is the lesson title students will see in the course.
            </p>
          </div>

          {/* File upload */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              File <span className="text-destructive">*</span>
            </Label>
            {uploadedFileUrl ? (
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
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-muted/20 p-6 transition hover:border-primary/60 hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Uploading…</p>
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
            <Label htmlFor="mat-desc" className="text-sm font-medium">
              Description (optional)
            </Label>
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
            <Label htmlFor="mat-tags" className="text-sm font-medium">
              Tags (optional)
            </Label>
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

          {/* Order */}
          <div className="space-y-1.5">
            <Label htmlFor="mat-order" className="text-sm font-medium">
              Lesson Order <span className="text-destructive">*</span>
            </Label>
            <Input
              id="mat-order"
              type="number"
              min={1}
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
              className="w-28"
              disabled={isBusy}
            />
          </div>

          {/* Free Preview */}
          <div className="flex items-center gap-2.5 rounded-xl border bg-muted/30 px-4 py-3">
            <Checkbox
              id="freePreview"
              checked={isFreePreview}
              onCheckedChange={(c) => setIsFreePreview(c === true)}
              disabled={isBusy}
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

          <Button
            type="submit"
            disabled={!uploadedFileUrl || !title.trim() || isBusy}
            className="w-full cursor-pointer"
            size="lg"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding Lesson...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Add Material Lesson
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddMaterialLessonPage;
