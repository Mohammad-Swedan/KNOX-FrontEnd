import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Video,
  HelpCircle,
  FileText,
  ExternalLink,
  Lock,
  Eye,
  Play,
  CheckCircle2,
  Trophy,
  Award,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/ui/avatar";
import type {
  CourseContentDto,
  CourseContentTopicDto,
  CourseContentLessonDto,
} from "../types";
import { LessonType } from "../types";
import type { LessonContentData } from "../hooks/useLessonContent";
import LessonContentViewer from "./LessonContentViewer";

interface CourseContentViewProps {
  content: CourseContentDto;
  instructorName?: string | null;
  instructorProfilePictureUrl?: string | null;
  trialVideoUrl?: string | null;
  onLessonClick?: (lesson: CourseContentLessonDto) => void;
  // Inline lesson content viewer state
  activeLessonId?: number | null;
  selectedLesson?: CourseContentLessonDto | null;
  lessonContent?: LessonContentData;
  lessonContentLoading?: boolean;
  lessonContentError?: string | null;
  onCloseLessonContent?: () => void;
  onRetryLessonContent?: () => void;
  // Mark lesson as completed
  onMarkCompleted?: (lessonId: number) => void;
  markCompletedLoading?: boolean;
  // Certificate callback
  onShowCertificate?: () => void;
}

export default function CourseContentView({
  content,
  instructorName,
  instructorProfilePictureUrl,
  trialVideoUrl,
  onLessonClick,
  activeLessonId,
  selectedLesson,
  lessonContent,
  lessonContentLoading,
  lessonContentError,
  onCloseLessonContent,
  onRetryLessonContent,
  onMarkCompleted,
  markCompletedLoading,
  onShowCertificate,
}: CourseContentViewProps) {
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(() => {
    return new Set(content.topics.length > 0 ? [content.topics[0].id] : []);
  });

  const toggleTopic = (topicId: number) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  };

  const sortedTopics = [...content.topics].sort((a, b) => a.order - b.order);

  // Auto-expand the topic that contains the active lesson
  useEffect(() => {
    if (!activeLessonId) return;
    const topicWithLesson = content.topics.find((t) =>
      t.lessons.some((l) => l.id === activeLessonId),
    );
    if (topicWithLesson && !expandedTopics.has(topicWithLesson.id)) {
      setExpandedTopics((prev) => new Set([...prev, topicWithLesson.id]));
    }
  }, [activeLessonId, content.topics]);

  // Scroll to the active lesson after it renders
  useEffect(() => {
    if (!activeLessonId) return;
    const timer = setTimeout(() => {
      const el = document.querySelector(`[data-lesson-id="${activeLessonId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [activeLessonId]);

  return (
    <div className="space-y-4">
      {/* Instructor & Course info card */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-4">
          {instructorName && (
            <Avatar className="h-16 w-16 shrink-0 border-2 border-primary/20 shadow-md">
              {instructorProfilePictureUrl ? (
                <AvatarImage
                  src={instructorProfilePictureUrl}
                  alt={instructorName}
                />
              ) : null}
              <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                {instructorName
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold truncate">
              {content.courseTitle}
            </h2>
            {instructorName && (
              <p className="text-sm text-muted-foreground mt-0.5">
                by{" "}
                <span className="font-medium text-foreground">
                  {instructorName}
                </span>
              </p>
            )}
            {content.isEnrolled && (
              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                <span>{content.totalLessons} lessons</span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                <span>{content.topics.length} topics</span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                <span className="text-primary font-medium">
                  {Math.round(content.progressPercentage)}% complete
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar for enrolled users */}
      {content.isEnrolled && (
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {content.isCompleted ? (
                <Trophy className="h-5 w-5 text-yellow-500" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              )}
              <span className="font-medium text-sm">
                {content.isCompleted ? "Course Completed!" : "Your Progress"}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {content.completedLessons}/{content.totalLessons} lessons
            </span>
          </div>
          <Progress value={content.progressPercentage} className="h-2" />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {Math.round(content.progressPercentage)}% complete
            </p>
            {content.progressPercentage >= 100 && onShowCertificate && (
              <Button
                size="sm"
                className="gap-1.5 bg-amber-500 hover:bg-amber-600 text-white shadow-sm cursor-pointer"
                onClick={onShowCertificate}
              >
                <Award className="h-4 w-4" />
                Certificate
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Course Content</h3>
        <span className="text-sm text-muted-foreground">
          {sortedTopics.length} topics • {content.totalLessons} lessons
        </span>
      </div>

      {/* Topics */}
      <div className="rounded-xl border overflow-hidden divide-y">
        {sortedTopics.map((topic) => (
          <ContentTopic
            key={topic.id}
            topic={topic}
            isExpanded={expandedTopics.has(topic.id)}
            onToggle={() => toggleTopic(topic.id)}
            isEnrolled={content.isEnrolled}
            onLessonClick={onLessonClick}
            activeLessonId={activeLessonId}
            selectedLesson={selectedLesson}
            lessonContent={lessonContent}
            lessonContentLoading={lessonContentLoading}
            lessonContentError={lessonContentError}
            onCloseLessonContent={onCloseLessonContent}
            onRetryLessonContent={onRetryLessonContent}
            onMarkCompleted={onMarkCompleted}
            markCompletedLoading={markCompletedLoading}
          />
        ))}
      </div>
    </div>
  );
}

// ── Topic Section ──────────────────────────────────────────

function ContentTopic({
  topic,
  isExpanded,
  onToggle,
  isEnrolled,
  onLessonClick,
  activeLessonId,
  selectedLesson,
  lessonContent,
  lessonContentLoading,
  lessonContentError,
  onCloseLessonContent,
  onRetryLessonContent,
  onMarkCompleted,
  markCompletedLoading,
}: {
  topic: CourseContentTopicDto;
  isExpanded: boolean;
  onToggle: () => void;
  isEnrolled: boolean;
  onLessonClick?: (lesson: CourseContentLessonDto) => void;
  activeLessonId?: number | null;
  selectedLesson?: CourseContentLessonDto | null;
  lessonContent?: LessonContentData;
  lessonContentLoading?: boolean;
  lessonContentError?: string | null;
  onCloseLessonContent?: () => void;
  onRetryLessonContent?: () => void;
  onMarkCompleted?: (lessonId: number) => void;
  markCompletedLoading?: boolean;
}) {
  const sortedLessons = [...topic.lessons].sort((a, b) => a.order - b.order);
  const completedCount = sortedLessons.filter((l) => l.isCompleted).length;
  const freeCount = sortedLessons.filter((l) => l.isFreePreview).length;

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-muted/30 hover:bg-muted/60 transition-colors text-left cursor-pointer"
      >
        <div className="shrink-0 text-muted-foreground">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-medium text-sm">{topic.title}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
          {isEnrolled && (
            <span className="text-primary font-medium">
              {completedCount}/{sortedLessons.length}
            </span>
          )}
          <span>{sortedLessons.length} lessons</span>
          {!isEnrolled && freeCount > 0 && (
            <Badge
              variant="outline"
              className="text-[10px] border-emerald-300 text-emerald-600 dark:text-emerald-400"
            >
              {freeCount} free
            </Badge>
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="divide-y divide-border/50">
          {sortedLessons.map((lesson) => (
            <div key={lesson.id} data-lesson-id={lesson.id}>
              <ContentLessonRow
                lesson={lesson}
                isEnrolled={isEnrolled}
                isActive={lesson.id === activeLessonId}
                onClick={() => onLessonClick?.(lesson)}
              />
              {/* Inline lesson content viewer — renders directly below the active lesson */}
              {lesson.id === activeLessonId && selectedLesson && (
                <div className="border-t border-b border-primary/20 bg-muted/20 animate-in slide-in-from-top-2 duration-200">
                  <LessonContentViewer
                    lesson={selectedLesson}
                    content={lessonContent ?? null}
                    loading={lessonContentLoading ?? false}
                    error={lessonContentError ?? null}
                    onClose={onCloseLessonContent ?? (() => {})}
                    onRetry={onRetryLessonContent ?? (() => {})}
                    isCompleted={selectedLesson.isCompleted}
                    onMarkCompleted={
                      isEnrolled && onMarkCompleted
                        ? () => onMarkCompleted(lesson.id)
                        : undefined
                    }
                    markCompletedLoading={markCompletedLoading}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Lesson Row ─────────────────────────────────────────────

function ContentLessonRow({
  lesson,
  isEnrolled,
  isActive,
  onClick,
}: {
  lesson: CourseContentLessonDto;
  isEnrolled: boolean;
  isActive?: boolean;
  onClick: () => void;
}) {
  const typeIcon =
    lesson.type === LessonType.Video ? (
      <Video className="h-4 w-4" />
    ) : lesson.type === LessonType.Quiz ? (
      <HelpCircle className="h-4 w-4" />
    ) : lesson.type === LessonType.ExternalVideo ? (
      <ExternalLink className="h-4 w-4" />
    ) : (
      <FileText className="h-4 w-4" />
    );

  const typeColors =
    lesson.type === LessonType.Video
      ? "bg-primary/10 text-primary dark:text-primary"
      : lesson.type === LessonType.Quiz
        ? "bg-secondary/10 text-secondary dark:text-secondary-foreground"
        : lesson.type === LessonType.ExternalVideo
          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
          : "bg-amber-500/10 text-amber-600 dark:text-amber-400";

  const typeLabel =
    lesson.type === LessonType.Video
      ? "Video"
      : lesson.type === LessonType.Quiz
        ? "Quiz"
        : lesson.type === LessonType.ExternalVideo
          ? "External Video"
          : "Document";

  const isAccessible = !lesson.isLocked;

  return (
    <button
      onClick={isAccessible ? onClick : undefined}
      className={`w-full flex items-center gap-3 px-3 sm:px-5 py-3 transition-colors text-left ${
        isAccessible
          ? "hover:bg-accent/40 cursor-pointer"
          : "opacity-60 cursor-not-allowed"
      } ${isActive ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
      disabled={!isAccessible}
    >
      {/* Completion / Type icon */}
      {isEnrolled && lesson.isCompleted ? (
        <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/15">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </div>
      ) : (
        <div
          className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${typeColors}`}
        >
          {typeIcon}
        </div>
      )}

      {/* Title + type label */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${isEnrolled && lesson.isCompleted ? "text-muted-foreground" : ""}`}
        >
          {lesson.title}
        </p>
        <span className="text-[11px] text-muted-foreground capitalize">
          {typeLabel}
          {isEnrolled && lesson.isCompleted && (
            <span className="ml-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              · Done
            </span>
          )}
        </span>
      </div>

      {/* Right: status indicators */}
      <div className="shrink-0 flex items-center gap-2">
        {lesson.isFreePreview && !isEnrolled && (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 text-[10px] font-semibold px-2 py-0.5">
            <Eye className="h-2.5 w-2.5 mr-1" />
            Preview
          </Badge>
        )}

        {lesson.isLocked && (
          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        )}

        {isAccessible &&
          lesson.type === LessonType.Video &&
          !lesson.isLocked && (
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <Play className="h-3.5 w-3.5 text-primary fill-primary ml-0.5" />
            </div>
          )}
      </div>
    </button>
  );
}
