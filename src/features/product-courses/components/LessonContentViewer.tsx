import { Loader2, AlertCircle, X, CheckCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { CourseContentLessonDto } from "../types";
import { LessonType } from "../types";
import type { LessonContentData } from "../hooks/useLessonContent";
import QuizLessonViewer from "./QuizLessonViewer";
import VideoLessonViewer from "./VideoLessonViewer";
import MaterialLessonViewer from "./MaterialLessonViewer";
import ExternalVideoViewer from "./ExternalVideoViewer";

interface LessonContentViewerProps {
  lesson?: CourseContentLessonDto;
  content: LessonContentData;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onRetry: () => void;
  isCompleted?: boolean;
  onMarkCompleted?: () => void;
  markCompletedLoading?: boolean;
}

export default function LessonContentViewer({
  lesson,
  content,
  loading,
  error,
  onClose,
  onRetry,
  isCompleted,
  onMarkCompleted,
  markCompletedLoading,
}: LessonContentViewerProps) {
  return (
    <div className="bg-card overflow-hidden">
      {/* Close button row */}
      <div className="flex items-center justify-between px-3 py-2 sm:px-4 border-b bg-muted/20">
        {/* Mark as completed button (for enrolled, not-yet-completed lessons) */}
        <div>
          {onMarkCompleted && !isCompleted && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 text-xs cursor-pointer border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
              onClick={onMarkCompleted}
              disabled={markCompletedLoading}
            >
              {markCompletedLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCircle className="h-3 w-3" />
              )}
              Mark Complete
            </Button>
          )}
          {isCompleted && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-3.5 w-3.5" />
              Completed
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 cursor-pointer"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content area */}
      <div className="p-3 sm:p-5">
        {loading && (
          <div className="flex flex-col items-center justify-center py-10 sm:py-14 gap-3">
            <Loader2 className="h-7 w-7 sm:h-8 sm:w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Loading lesson content...
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-10 sm:py-14 gap-4">
            <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-red-400" />
            <div className="text-center space-y-1">
              <p className="font-medium text-sm sm:text-base">
                Could not load content
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {error}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="cursor-pointer"
            >
              Try Again
            </Button>
          </div>
        )}

        {!loading && !error && content?.kind === "quiz" && (
          <QuizLessonViewer quiz={content.data} />
        )}

        {!loading && !error && content?.kind === "video" && (
          <VideoLessonViewer video={content.data} onRefresh={onRetry} />
        )}

        {!loading && !error && content?.kind === "material" && (
          <MaterialLessonViewer material={content.data} />
        )}

        {/* ExternalVideo: directUrl is already in the lesson object — no API fetch */}
        {!loading &&
          !error &&
          lesson?.type === LessonType.ExternalVideo &&
          (lesson?.directUrl ? (
            <ExternalVideoViewer directUrl={lesson.directUrl} />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No URL set for this lesson.
            </p>
          ))}
      </div>
    </div>
  );
}
