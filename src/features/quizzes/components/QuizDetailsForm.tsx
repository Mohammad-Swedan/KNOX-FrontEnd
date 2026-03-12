import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Badge } from "@/shared/ui/badge";
import { X } from "lucide-react";

interface QuizDetailsFormProps {
  title: string;
  description: string;
  tags: string[];
  tagInput: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTagInputChange: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
}

export const QuizDetailsForm = ({
  title,
  description,
  tags,
  tagInput,
  onTitleChange,
  onDescriptionChange,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
}: QuizDetailsFormProps) => {
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      onAddTag();
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Quiz Details</CardTitle>
        <CardDescription>Basic information about your quiz</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            placeholder="Enter quiz title..."
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            maxLength={200}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Enter quiz description..."
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              onDescriptionChange(e.target.value)
            }
            rows={3}
            maxLength={1000}
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="quiz-tags">Tags (Optional)</Label>
          <div className="flex gap-2">
            <Input
              id="quiz-tags"
              placeholder="Add a tag and press Enter or comma..."
              value={tagInput}
              onChange={(e) => onTagInputChange(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={onAddTag}
            />
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="gap-1 pr-1 bg-primary/10 text-primary border border-primary/20"
                >
                  {tag}
                  <button
                    type="button"
                    title={`Remove tag ${tag}`}
                    onClick={() => onRemoveTag(tag)}
                    className="ml-0.5 rounded-full hover:bg-primary/20 p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
