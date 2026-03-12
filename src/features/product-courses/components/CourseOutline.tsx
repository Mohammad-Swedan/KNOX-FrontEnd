import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Video,
  HelpCircle,
  FileText,
  Lock,
  Eye,
  Play,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import type { TopicOutlineDto, LessonOutlineDto } from "../types";
import { LessonType } from "../types";

interface CourseOutlineProps {
  topics: TopicOutlineDto[];
  onFreePreviewClick?: (lesson: LessonOutlineDto) => void;
  onLockedClick?: () => void;
}

export default function CourseOutline({
  topics,
  onFreePreviewClick,
  onLockedClick,
}: CourseOutlineProps) {
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(() => {
    // Auto-expand first topic
    return new Set(topics.length > 0 ? [topics[0].id] : []);
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

  const sortedTopics = [...topics].sort((a, b) => a.order - b.order);
  const totalLessons = topics.reduce((sum, t) => sum + t.lessons.length, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Course Content</h3>
        <span className="text-sm text-muted-foreground">
          {sortedTopics.length} topics • {totalLessons} lessons
        </span>
      </div>

      <div className="rounded-xl border overflow-hidden divide-y">
        {sortedTopics.map((topic) => {
          const isExpanded = expandedTopics.has(topic.id);
          const sortedLessons = [...topic.lessons].sort(
            (a, b) => a.order - b.order,
          );
          const freeCount = sortedLessons.filter((l) => l.isFreePreview).length;

          return (
            <div key={topic.id}>
              {/* Topic header */}
              <button
                onClick={() => toggleTopic(topic.id)}
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
                  <span>{sortedLessons.length} lessons</span>
                  {freeCount > 0 && (
                    <Badge
                      variant="outline"
                      className="text-[10px] border-emerald-300 text-emerald-600 dark:text-emerald-400"
                    >
                      {freeCount} free
                    </Badge>
                  )}
                </div>
              </button>

              {/* Lessons */}
              {isExpanded && (
                <div className="divide-y divide-border/50">
                  {sortedLessons.map((lesson) => (
                    <OutlineLessonRow
                      key={lesson.id}
                      lesson={lesson}
                      onFreePreviewClick={() => onFreePreviewClick?.(lesson)}
                      onLockedClick={() => onLockedClick?.()}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Lesson Row ─────────────────────────────────────────────

function OutlineLessonRow({
  lesson,
  onFreePreviewClick,
  onLockedClick,
}: {
  lesson: LessonOutlineDto;
  onFreePreviewClick: () => void;
  onLockedClick: () => void;
}) {
  const typeIcon =
    lesson.type === LessonType.Video ? (
      <Video className="h-4 w-4" />
    ) : lesson.type === LessonType.Quiz ? (
      <HelpCircle className="h-4 w-4" />
    ) : (
      <FileText className="h-4 w-4" />
    );

  const typeColors =
    lesson.type === LessonType.Video
      ? "bg-primary/10 text-primary dark:text-primary"
      : lesson.type === LessonType.Quiz
        ? "bg-secondary/10 text-secondary dark:text-secondary-foreground"
        : "bg-amber-500/10 text-amber-600 dark:text-amber-400";

  const handleClick = () => {
    if (lesson.isFreePreview) {
      onFreePreviewClick();
    } else {
      onLockedClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-accent/40 transition-colors text-left cursor-pointer"
    >
      {/* Type icon */}
      <div
        className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${typeColors}`}
      >
        {typeIcon}
      </div>

      {/* Title + type label */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{lesson.title}</p>
        <span className="text-[11px] text-muted-foreground capitalize">
          {lesson.type === LessonType.Video
            ? "Video"
            : lesson.type === LessonType.Quiz
              ? "Quiz"
              : "Document"}
        </span>
      </div>

      {/* Right: free preview or lock */}
      <div className="shrink-0 flex items-center gap-2">
        {lesson.isFreePreview ? (
          <div className="flex items-center gap-1.5">
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 text-[10px] font-semibold px-2 py-0.5">
              <Eye className="h-2.5 w-2.5 mr-1" />
              Preview
            </Badge>
            {lesson.type === LessonType.Video && (
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <Play className="h-3.5 w-3.5 text-primary fill-primary ml-0.5" />
              </div>
            )}
          </div>
        ) : (
          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        )}
      </div>
    </button>
  );
}
