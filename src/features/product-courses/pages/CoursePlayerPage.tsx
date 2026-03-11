import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  Download,
  PartyPopper,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import { Card, CardContent } from "@/shared/ui/card";
import { useEnrolledOutline } from "../hooks/useProductCourses";
import { useCompleteLesson } from "../hooks/useEnrollment";
import { useLessonContent } from "../hooks/useLessonContent";
import EnrolledCourseOutline from "../components/EnrolledCourseOutline";
import QuizLessonViewer from "../components/QuizLessonViewer";
import VideoLessonViewer from "../components/VideoLessonViewer";
import MaterialLessonViewer from "../components/MaterialLessonViewer";
import ExternalVideoViewer from "../components/ExternalVideoViewer";
import type { LessonProgressDto } from "../types";
import { LessonType } from "../types";

const CoursePlayerPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const courseId = id ? parseInt(id) : undefined;

  const { outline, loading, refetch } = useEnrolledOutline(courseId);
  const { complete, loading: completing } = useCompleteLesson();

  const [activeLesson, setActiveLesson] = useState<LessonProgressDto | null>(
    null,
  );

  // Lesson content fetching
  const {
    content: lessonContent,
    loading: lessonContentLoading,
    error: lessonContentError,
    fetchContent: fetchLessonContent,
  } = useLessonContent();

  // Auto-select first incomplete lesson on load
  const selectInitialLesson = useCallback(() => {
    if (!outline) return;
    // Find first incomplete lesson
    for (const topic of [...outline.topics].sort((a, b) => a.order - b.order)) {
      for (const lesson of [...topic.lessons].sort(
        (a, b) => a.order - b.order,
      )) {
        if (!lesson.isCompleted) {
          setActiveLesson(lesson);
          fetchLessonContent(lesson.id, lesson.type);
          return;
        }
      }
    }
    // All done, select the last lesson
    const lastTopic = [...outline.topics].sort((a, b) => b.order - a.order)[0];
    if (lastTopic) {
      const lastLesson = [...lastTopic.lessons].sort(
        (a, b) => b.order - a.order,
      )[0];
      if (lastLesson) {
        setActiveLesson(lastLesson);
        fetchLessonContent(lastLesson.id, lastLesson.type);
      }
    }
  }, [outline, fetchLessonContent]);

  /** Handle lesson click from sidebar */
  const handleLessonClick = useCallback(
    (lesson: LessonProgressDto) => {
      setActiveLesson(lesson);
      fetchLessonContent(lesson.id, lesson.type);
    },
    [fetchLessonContent],
  );

  // Auto-select on first load
  useState(() => {
    if (outline && !activeLesson) selectInitialLesson();
  });

  // Also trigger when outline loads
  if (outline && !activeLesson) {
    selectInitialLesson();
  }

  const handleMarkComplete = async () => {
    if (!outline || !activeLesson) return;
    try {
      await complete(outline.enrollmentId, activeLesson.id);
      toast.success("Lesson marked as complete!");
      refetch();
      // Update active lesson state
      setActiveLesson((prev) => (prev ? { ...prev, isCompleted: true } : prev));
    } catch {
      toast.error("Failed to mark lesson as complete.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!outline) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg font-medium">Course not found or not enrolled</p>
        <Button
          variant="outline"
          className="mt-4 cursor-pointer"
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 max-w-7xl">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer shrink-0"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-semibold truncate">
                {outline.courseTitle}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <Progress
                  value={outline.progressPercentage}
                  className="h-1.5 flex-1 max-w-xs"
                />
                <span className="text-xs text-muted-foreground shrink-0">
                  {outline.completedLessons}/{outline.totalLessons} •{" "}
                  {Math.round(outline.progressPercentage)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Completion banner */}
      {outline.isCompleted && (
        <div className="bg-linear-to-r from-emerald-500 to-teal-600 text-white">
          <div className="container mx-auto px-4 py-4 max-w-7xl flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <PartyPopper className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">
                  Congratulations! You completed this course.
                </p>
                <p className="text-sm text-white/80">
                  All {outline.totalLessons} lessons finished.
                </p>
              </div>
            </div>
            {outline.certificateId && (
              <Button
                className="bg-white text-emerald-700 hover:bg-white/90 cursor-pointer"
                onClick={() => navigate("/certificates/verify")}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Certificate
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="container mx-auto max-w-7xl flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="lg:w-80 xl:w-96 shrink-0 border-r bg-card/50 lg:min-h-[calc(100vh-8rem)] overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-sm">Course Content</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {outline.completedLessons} of {outline.totalLessons} lessons
              completed
            </p>
          </div>
          <EnrolledCourseOutline
            topics={outline.topics}
            activeLessonId={activeLesson?.id}
            onLessonClick={handleLessonClick}
          />
        </aside>

        {/* Content area */}
        <main className="flex-1 p-6">
          {activeLesson ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Lesson title */}
              <div>
                <h2 className="text-xl font-bold">{activeLesson.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeLesson.type === LessonType.Video
                    ? "Video Lesson"
                    : activeLesson.type === LessonType.Quiz
                      ? "Quiz"
                      : activeLesson.type === LessonType.ExternalVideo
                        ? "External Video"
                        : "Document"}
                </p>
              </div>

              {/* Content — fetched from lesson endpoints */}
              {lessonContentLoading && (
                <div className="flex flex-col items-center justify-center py-14 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Loading lesson content...
                  </p>
                </div>
              )}

              {lessonContentError && !lessonContentLoading && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
                    <p className="text-lg font-medium">
                      Could not load content
                    </p>
                    <p className="text-sm text-muted-foreground text-center">
                      {lessonContentError}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        fetchLessonContent(activeLesson.id, activeLesson.type)
                      }
                      className="cursor-pointer"
                    >
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              )}

              {!lessonContentLoading &&
                !lessonContentError &&
                lessonContent?.kind === "quiz" && (
                  <QuizLessonViewer quiz={lessonContent.data} />
                )}

              {!lessonContentLoading &&
                !lessonContentError &&
                lessonContent?.kind === "video" && (
                  <VideoLessonViewer
                    video={lessonContent.data}
                    onRefresh={() =>
                      fetchLessonContent(activeLesson.id, activeLesson.type)
                    }
                  />
                )}

              {!lessonContentLoading &&
                !lessonContentError &&
                lessonContent?.kind === "material" && (
                  <MaterialLessonViewer material={lessonContent.data} />
                )}

              {!lessonContentLoading &&
                !lessonContentError &&
                lessonContent?.kind === "external" &&
                (lessonContent.data.directUrl ? (
                  <ExternalVideoViewer
                    directUrl={lessonContent.data.directUrl}
                  />
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 gap-2">
                      <p className="text-muted-foreground text-sm">
                        No URL set for this external video lesson.
                      </p>
                    </CardContent>
                  </Card>
                ))}

              {!lessonContentLoading &&
                !lessonContentError &&
                !lessonContent && (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 gap-2">
                      <p className="text-muted-foreground text-sm">
                        No content linked to this lesson yet.
                      </p>
                    </CardContent>
                  </Card>
                )}

              {/* Mark as complete */}
              {!activeLesson.isCompleted && (
                <Button
                  className="w-full cursor-pointer"
                  size="lg"
                  onClick={handleMarkComplete}
                  disabled={completing}
                >
                  {completing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Marking complete...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Complete
                    </>
                  )}
                </Button>
              )}

              {activeLesson.isCompleted && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950/30 rounded-lg px-4 py-3">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Lesson completed</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <p className="text-lg font-medium">Select a lesson to begin</p>
              <p className="text-sm">
                Choose a lesson from the sidebar to start learning.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CoursePlayerPage;
