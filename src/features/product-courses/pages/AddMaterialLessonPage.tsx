import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, FileText, Loader2, Search, CheckCircle2, ExternalLink,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import { toast } from "sonner";
import { addLesson } from "../api";
import { useLessons, useProductCourse } from "../hooks/useProductCourses";
import { getCourseContents } from "@/features/materials/api";
import type { MaterialItem } from "@/features/materials/types";

const AddMaterialLessonPage = () => {
  const { id, topicId: topicIdParam } = useParams<{ id: string; topicId: string }>();
  const navigate = useNavigate();
  const courseId = parseInt(id || "0");
  const topicId = parseInt(topicIdParam || "0");

  const { course, loading: courseLoading } = useProductCourse(courseId);
  const { lessons } = useLessons(courseId);

  const nextOrder =
    lessons.length > 0 ? Math.max(...lessons.map((l) => l.order)) + 1 : 1;

  const [title, setTitle] = useState("");
  const [order, setOrder] = useState(nextOrder);
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialItem | null>(null);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!course?.academicCourseId) return;
    setMaterialsLoading(true);
    getCourseContents(String(course.academicCourseId))
      .then((res) => setMaterials(res.materials))
      .catch(() => setMaterials([]))
      .finally(() => setMaterialsLoading(false));
  }, [course?.academicCourseId]);

  const filtered = materials.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectMaterial = (mat: MaterialItem) => {
    setSelectedMaterial(mat);
    if (!title) setTitle(mat.title);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial || !title.trim()) return;
    setSubmitting(true);
    try {
      await addLesson(courseId, topicId, {
        title: title.trim(),
        order,
        type: 2,
        isFreePreview,
        referenceId: selectedMaterial.id,
      });
      toast.success("Material lesson added!");
      navigate(`/dashboard/product-courses/${id}/lessons`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add lesson");
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = courseLoading || materialsLoading;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">New Material Lesson</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Pick a course material and configure the lesson
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Select Material <span className="text-destructive">*</span>
            </Label>

            {selectedMaterial && (
              <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedMaterial.title}</p>
                  {selectedMaterial.contentUrl && (
                    <a
                      href={selectedMaterial.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Preview <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search materials..."
                className="pl-9"
                disabled={isLoading}
              />
            </div>

            <div className="rounded-xl border overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading materials...
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                  <FileText className="h-8 w-8 opacity-30" />
                  <p className="text-sm">
                    {search ? "No materials match your search" : "No materials found in this course"}
                  </p>
                  {!search && (
                    <p className="text-xs opacity-70">
                      Upload materials to the course first via the Materials section.
                    </p>
                  )}
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto divide-y">
                  {filtered.map((mat) => {
                    const isSelected = selectedMaterial?.id === mat.id;
                    return (
                      <button
                        key={mat.id}
                        type="button"
                        onClick={() => handleSelectMaterial(mat)}
                        className={[
                          "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                          isSelected ? "bg-primary/8 text-primary" : "hover:bg-muted/50",
                        ].join(" ")}
                      >
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${isSelected ? "bg-primary/10" : "bg-amber-500/10"}`}>
                          <FileText className={`h-3.5 w-3.5 ${isSelected ? "text-primary" : "text-amber-600"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{mat.title}</p>
                          {mat.description && (
                            <p className="text-xs text-muted-foreground truncate">{mat.description}</p>
                          )}
                        </div>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-sm font-medium">
              Lesson Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Chapter 1 Reading"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="order" className="text-sm font-medium">
              Lesson Order <span className="text-destructive">*</span>
            </Label>
            <Input
              id="order"
              type="number"
              min={1}
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
              className="w-28"
            />
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border bg-muted/30 px-4 py-3">
            <Checkbox
              id="freePreview"
              checked={isFreePreview}
              onCheckedChange={(c) => setIsFreePreview(c === true)}
            />
            <div>
              <Label htmlFor="freePreview" className="cursor-pointer text-sm font-medium">
                Free Preview
              </Label>
              <p className="text-xs text-muted-foreground">Accessible without enrollment</p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!selectedMaterial || !title.trim() || submitting}
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
