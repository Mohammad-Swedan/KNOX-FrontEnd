import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import { useLessons, useProductCourse } from "../hooks/useProductCourses";

const AddQuizLessonPage = () => {
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

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !course?.academicCourseId) return;

    const params = new URLSearchParams({
      productCourseId: String(courseId),
      topicId: String(topicId),
      lessonTitle: title.trim(),
      lessonOrder: String(order),
      lessonIsFree: String(isFreePreview),
      returnTo: `/dashboard/product-courses/${id}/lessons`,
    });

    navigate(
      `/courses/${course.academicCourseId}/quizzes/add?${params.toString()}`
    );
  };

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
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
            <HelpCircle className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">New Quiz Lesson</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Step 1 of 2  set lesson details, then build the quiz
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">1</div>
          <div className="h-px flex-1 bg-border" />
          <div className="flex items-center justify-center w-6 h-6 rounded-full border border-border text-xs font-bold text-muted-foreground shrink-0">2</div>
        </div>

        {/* Form */}
        <form onSubmit={handleContinue} className="space-y-5">

          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-sm font-medium">
              Lesson Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Chapter 1 Quiz"
              required
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              This is the lesson title students will see in the course.
            </p>
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
            className="w-full cursor-pointer gap-2"
            size="lg"
            disabled={!title.trim() || courseLoading || !course?.academicCourseId}
          >
            {courseLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading
              </>
            ) : (
              <>
                Continue to Quiz Builder
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddQuizLessonPage;
