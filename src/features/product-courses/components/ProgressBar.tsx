import { Progress } from "@/shared/ui/progress";

interface ProgressBarProps {
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
}

export default function ProgressBar({
  completedLessons,
  totalLessons,
  progressPercentage,
}: ProgressBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {completedLessons} / {totalLessons} lessons
        </span>
        <span className="font-medium">{Math.round(progressPercentage)}%</span>
      </div>
      <Progress value={progressPercentage} />
    </div>
  );
}
