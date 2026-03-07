import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";
import { useProductCoursesByAcademic } from "../hooks/useProductCourses";
import { publishProductCourse } from "../api";
import { fetchCourseById } from "@/features/courses/api";
import { useUserRole } from "@/hooks/useUserRole";
import ProductCourseCard from "../components/ProductCourseCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { useEffect } from "react";

const ProductCourseListPage = () => {
  const { academicCourseId } = useParams<{ academicCourseId: string }>();
  const navigate = useNavigate();
  const { hasRole } = useUserRole();
  const courseIdNum = parseInt(academicCourseId || "0");
  const canManage = hasRole(["SuperAdmin", "Admin", "Instructor"]);

  const { courses, loading, refetch } = useProductCoursesByAcademic(courseIdNum);
  const [courseName, setCourseName] = useState("");
  const [publishDialog, setPublishDialog] = useState<number | null>(null);
  const [publishing, setPublishing] = useState(false);

  // Fetch academic course name
  useEffect(() => {
    if (courseIdNum) {
      fetchCourseById(courseIdNum)
        .then((c) => setCourseName(c.courseName))
        .catch(() => setCourseName("Unknown Course"));
    }
  }, [courseIdNum]);

  const handlePublish = async () => {
    if (!publishDialog) return;
    setPublishing(true);
    try {
      await publishProductCourse(publishDialog);
      toast.success("Course published successfully!");
      setPublishDialog(null);
      refetch();
    } catch {
      toast.error("Failed to publish course");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-4 gap-2 cursor-pointer"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Product Courses</h1>
            {courseName && (
              <p className="text-muted-foreground">for {courseName}</p>
            )}
          </div>
          {canManage && (
            <Button
              className="cursor-pointer"
              onClick={() =>
                navigate(
                  `/dashboard/courses/${academicCourseId}/product-courses/create`
                )
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Product Course
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-muted-foreground">Loading product courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-lg font-medium">No product courses yet</p>
          <p className="text-muted-foreground mt-1">
            {canManage
              ? "Create your first product course to get started."
              : "No product courses available for this course."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <ProductCourseCard
              key={course.id}
              course={course}
              showManageActions={canManage}
              onPublish={(id) => setPublishDialog(id)}
            />
          ))}
        </div>
      )}

      {/* Publish confirmation dialog */}
      <Dialog
        open={publishDialog !== null}
        onOpenChange={() => setPublishDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Course?</DialogTitle>
            <DialogDescription>
              This will make the course visible to students. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPublishDialog(null)}
              disabled={publishing}
            >
              Cancel
            </Button>
            <Button onClick={handlePublish} disabled={publishing} className="cursor-pointer">
              {publishing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductCourseListPage;
