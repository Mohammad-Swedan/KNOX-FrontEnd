import { useState } from "react";
import SEO from "@/shared/components/seo/SEO";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { toast } from "sonner";
import { createProductCourse } from "../api";
import type {
  CreateProductCourseRequest,
  UpdateProductCourseRequest,
} from "../types";
import ProductCourseForm from "../components/ProductCourseForm";

const CreateProductCoursePage = () => {
  const { academicCourseId } = useParams<{ academicCourseId: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    data: CreateProductCourseRequest | UpdateProductCourseRequest,
  ) => {
    setIsSubmitting(true);
    try {
      await createProductCourse(data as CreateProductCourseRequest);
      toast.success("Product course created!");
      navigate(`/dashboard/courses/${academicCourseId}/product-courses`);
    } catch (err) {
      console.error("Failed to create product course:", err);
      toast.error("Failed to create product course");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO title="إنشاء دورة | eCampus" noIndex={true} hreflang={false} />
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
            <CardTitle>Create Product Course</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductCourseForm
              academicCourseId={
                academicCourseId ? parseInt(academicCourseId) : undefined
              }
              hideLocationSelectors
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitLabel="Create Course"
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default CreateProductCoursePage;
