import {
  FileText,
  HelpCircle,
  Eye,
  Play,
  CheckCircle2,
  Lock,
  Video,
} from "lucide-react";
import type { Lesson } from "../types";

interface LessonListProps {
  lessons: Lesson[];
  onLessonClick?: (lesson: Lesson) => void;
}

export default function LessonList({
  lessons,
  onLessonClick,
}: LessonListProps) {
  if (lessons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 opacity-40" />
        </div>
        <p className="text-base font-medium">No lessons yet</p>
        <p className="text-sm mt-1 opacity-70">
          Add your first lesson to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 p-1">
      {lessons.map((lesson, idx) => (
        <LessonRow
          key={lesson.id}
          lesson={lesson}
          index={idx}
          onClick={() => onLessonClick?.(lesson)}
        />
      ))}
    </div>
  );
}

// ── Row ───────────────────────────────────────────────────

interface RowProps {
  lesson: Lesson;
  index: number;
  onClick: () => void;
}

function LessonRow({ lesson, index, onClick }: RowProps) {
  const isVideo = lesson.type === "Video";
  const isQuiz = lesson.type === "Quiz";
  const isClickable = !!lesson.referenceId;

  const iconConfig = isVideo
    ? {
        icon: <Video className="h-4 w-4" />,
        bg: "bg-primary/10 text-primary dark:text-primary",
      }
    : isQuiz
      ? {
          icon: <HelpCircle className="h-4 w-4" />,
          bg: "bg-secondary/10 text-secondary dark:text-secondary-foreground",
        }
      : {
          icon: <FileText className="h-4 w-4" />,
          bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        };

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={[
        "group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-150",
        isClickable
          ? "cursor-pointer hover:bg-accent/60 active:scale-[0.995]"
          : "cursor-default opacity-50",
      ].join(" ")}
    >
      {/* Index */}
      <span className="shrink-0 w-5 text-center text-xs font-semibold text-muted-foreground/60 tabular-nums select-none">
        {index + 1}
      </span>

      {/* Type icon */}
      <div
        className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${iconConfig.bg}`}
      >
        {iconConfig.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug truncate group-hover:text-primary transition-colors">
          {lesson.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-muted-foreground/70 capitalize">
            {lesson.type}
          </span>
          {lesson.isFreePreview && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full px-2 py-0.5">
              <Eye className="h-2.5 w-2.5" />
              Free
            </span>
          )}
        </div>
      </div>

      {/* Right action */}
      <div className="shrink-0">
        {lesson.isCompleted ? (
          <div className="w-7 h-7 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>
        ) : isClickable && isVideo ? (
          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-150">
            <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
          </div>
        ) : !isClickable ? (
          <div className="w-7 h-7 rounded-full bg-muted/50 flex items-center justify-center">
            <Lock className="h-3.5 w-3.5 text-muted-foreground/40" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
