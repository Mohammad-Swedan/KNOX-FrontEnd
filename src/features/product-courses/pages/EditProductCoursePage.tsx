import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { toast } from "sonner";
import { updateProductCourse } from "../api";
import { useProductCourse } from "../hooks/useProductCourses";
import ProductCourseForm from "../components/ProductCourseForm";
import type { UpdateProductCourseRequest } from "../types";

const EditProductCoursePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const courseId = parseInt(id || "0");
  const { course, loading } = useProductCourse(courseId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: UpdateProductCourseRequest) => {
    setIsSubmitting(true);
    try {
      await updateProductCourse(courseId, data);
      toast.success("Product course updated!");
      navigate(-1);
    } catch (err) {
      console.error("Failed to update product course:", err);
      toast.error("Failed to update product course");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <Button
        variant="ghost"
        className="mb-4 gap-2 cursor-pointer"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Product Course</CardTitle>
        </CardHeader>
        <CardContent>
          {course && (
            <ProductCourseForm
              initialData={course}
              courseId={courseId}
              academicCourseId={course.academicCourseId ?? undefined}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitLabel="Update Course"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProductCoursePage;
