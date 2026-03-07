import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { useLessons } from "../hooks/useProductCourses";
import VideoUploader from "../components/VideoUploader";

const AddVideoLessonPage = () => {
  const { id, topicId: topicIdParam } = useParams<{ id: string; topicId: string }>();
  const navigate = useNavigate();
  const courseId = parseInt(id || "0");
  const topicId = parseInt(topicIdParam || "0");
  const { lessons } = useLessons(courseId);

  const nextOrder = lessons.length > 0
    ? Math.max(...lessons.map((l) => l.order)) + 1
    : 1;

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
          <CardTitle>Add Video Lesson</CardTitle>
        </CardHeader>
        <CardContent>
          <VideoUploader
            productCourseId={courseId}
            topicId={topicId}
            nextOrder={nextOrder}
            onSuccess={() =>
              navigate(`/dashboard/product-courses/${id}/lessons`)
            }
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AddVideoLessonPage;
