import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Video,
  HelpCircle,
  FileText,
  ExternalLink,
  CheckCircle2,
  Circle,
  Play,
} from "lucide-react";
import { Progress } from "@/shared/ui/progress";
import type { TopicWithProgressDto, LessonProgressDto } from "../types";
import { LessonType } from "../types";

interface EnrolledCourseOutlineProps {
  topics: TopicWithProgressDto[];
  activeLessonId?: number;
  onLessonClick: (lesson: LessonProgressDto) => void;
}

export default function EnrolledCourseOutline({
  topics,
  activeLessonId,
  onLessonClick,
}: EnrolledCourseOutlineProps) {
  const [expandedTopicId, setExpandedTopicId] = useState<number | null>(() => {
    // Auto-expand topic containing active lesson, or first topic
    if (activeLessonId) {
      for (const topic of topics) {
        if (topic.lessons.some((l) => l.id === activeLessonId)) {
          return topic.id;
        }
      }
    }
    return topics.length > 0 ? topics[0].id : null;
  });

  const toggleTopic = (topicId: number) => {
    // Only allow one topic expanded at a time (accordion behavior)
    setExpandedTopicId((prev) => (prev === topicId ? null : topicId));
  };

  const sortedTopics = [...topics].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col h-full">
      <div className="divide-y overflow-y-auto">
        {sortedTopics.map((topic) => {
          const isExpanded = expandedTopicId === topic.id;
          const sortedLessons = [...topic.lessons].sort(
            (a, b) => a.order - b.order,
          );
          const completedCount = sortedLessons.filter(
            (l) => l.isCompleted,
          ).length;

          return (
            <div key={topic.id}>
              {/* Topic header */}
              <button
                onClick={() => toggleTopic(topic.id)}
                className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="shrink-0 text-muted-foreground">
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <span className="font-medium text-sm flex-1 truncate">
                    {topic.title}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {completedCount}/{sortedLessons.length}
                  </span>
                </div>
                <div className="ml-5.5">
                  <Progress
                    value={
                      sortedLessons.length > 0
                        ? (completedCount / sortedLessons.length) * 100
                        : 0
                    }
                    className="h-1"
                  />
                </div>
              </button>

              {/* Lessons */}
              {isExpanded && (
                <div className="pb-1">
                  {sortedLessons.map((lesson) => (
                    <SidebarLessonRow
                      key={lesson.id}
                      lesson={lesson}
                      isActive={lesson.id === activeLessonId}
                      onClick={() => onLessonClick(lesson)}
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

function SidebarLessonRow({
  lesson,
  isActive,
  onClick,
}: {
  lesson: LessonProgressDto;
  isActive: boolean;
  onClick: () => void;
}) {
  const typeIcon =
    lesson.type === LessonType.Video ? (
      <Video className="h-3.5 w-3.5" />
    ) : lesson.type === LessonType.Quiz ? (
      <HelpCircle className="h-3.5 w-3.5" />
    ) : lesson.type === LessonType.ExternalVideo ? (
      <ExternalLink className="h-3.5 w-3.5" />
    ) : (
      <FileText className="h-3.5 w-3.5" />
    );

  return (
    <button
      onClick={onClick}
      className={[
        "w-full flex items-center gap-2.5 pl-9 pr-4 py-2.5 text-left transition-all cursor-pointer text-sm",
        isActive
          ? "bg-primary/10 text-primary border-l-2 border-primary"
          : "hover:bg-muted/40",
      ].join(" ")}
    >
      {/* Completion indicator */}
      <div className="shrink-0">
        {lesson.isCompleted ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : isActive ? (
          <Play className="h-4 w-4 text-primary fill-primary" />
        ) : (
          <Circle className="h-4 w-4 text-muted-foreground/40" />
        )}
      </div>

      {/* Type icon */}
      <div className="shrink-0 text-muted-foreground">{typeIcon}</div>

      {/* Title */}
      <span className="flex-1 truncate text-[13px]">{lesson.title}</span>
    </button>
  );
}
