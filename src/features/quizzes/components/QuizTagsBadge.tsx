import { Tag, ChevronUp } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

interface QuizTagsBadgeProps {
  tags: string[];
}

export const QuizTagsBadge = ({ tags }: QuizTagsBadgeProps) => {
  if (!tags || tags.length === 0) return null;

  const firstTag = tags[0];
  const remainingTags = tags.slice(1);
  const hasMore = remainingTags.length > 0;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />

      {/* First tag */}
      <Badge
        variant="secondary"
        className="text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
      >
        {firstTag}
      </Badge>

      {/* More tags indicator with tooltip */}
      {hasMore && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="inline-flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              +{remainingTags.length}
              <ChevronUp className="h-3 w-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="flex flex-wrap gap-1.5 max-w-56 p-3"
          >
            {remainingTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/15 text-primary border border-primary/25"
              >
                {tag}
              </span>
            ))}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};
