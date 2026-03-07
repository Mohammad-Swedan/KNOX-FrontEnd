import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  RotateCcw,
  Trophy,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import type { LessonQuizContent, LessonQuizQuestion } from "../types";

interface QuizLessonViewerProps {
  quiz: LessonQuizContent;
}

export default function QuizLessonViewer({ quiz }: QuizLessonViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoices, setSelectedChoices] = useState<
    Record<number, number[]>
  >({});
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [finished, setFinished] = useState(false);

  const questions = quiz.questions;
  const total = questions.length;
  const current = questions[currentIndex] as LessonQuizQuestion | undefined;

  const toggleChoice = (questionId: number, choiceId: number) => {
    if (revealed.has(questionId)) return;
    setSelectedChoices((prev) => {
      const existing = prev[questionId] ?? [];
      if (existing.includes(choiceId)) {
        return { ...prev, [questionId]: existing.filter((c) => c !== choiceId) };
      }
      // For single-choice (type 1) or true/false (type 3), allow only one
      if (current?.type === 1 || current?.type === 3) {
        return { ...prev, [questionId]: [choiceId] };
      }
      return { ...prev, [questionId]: [...existing, choiceId] };
    });
  };

  const revealAnswer = (questionId: number) => {
    setRevealed((prev) => new Set(prev).add(questionId));
  };

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedChoices({});
    setRevealed(new Set());
    setFinished(false);
  };

  // Calculate score
  const getScore = () => {
    let correct = 0;
    for (const q of questions) {
      const selected = selectedChoices[q.id] ?? [];
      const correctIds = q.choices
        .filter((c) => c.isCorrect)
        .map((c) => c.id);
      const isCorrect =
        selected.length === correctIds.length &&
        selected.every((id) => correctIds.includes(id));
      if (isCorrect) correct++;
    }
    return correct;
  };

  // Finished screen
  if (finished) {
    const score = getScore();
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-6">
          <div className="relative">
            <Trophy
              className={`h-16 w-16 ${
                percentage >= 70 ? "text-yellow-500" : "text-muted-foreground"
              }`}
            />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold">Quiz Complete!</h3>
            <p className="text-muted-foreground">{quiz.title}</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-4xl font-bold">
              {score}/{total}
            </p>
            <p className="text-sm text-muted-foreground">
              {percentage}% correct
            </p>
          </div>
          <Progress value={percentage} className="w-64 h-2" />
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleRestart}
              className="cursor-pointer"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t w-full justify-center">
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3.5 w-3.5" /> {quiz.likes}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsDown className="h-3.5 w-3.5" /> {quiz.dislikes}
            </span>
            <span>by {quiz.writerName}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!current) return null;

  const isRevealed = revealed.has(current.id);
  const selected = selectedChoices[current.id] ?? [];
  const correctIds = current.choices
    .filter((c) => c.isCorrect)
    .map((c) => c.id);

  return (
    <div className="space-y-4">
      {/* Quiz header */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{quiz.title}</CardTitle>
            <Badge variant="outline" className="font-mono">
              {currentIndex + 1} / {total}
            </Badge>
          </div>
          {quiz.description && (
            <p className="text-sm text-muted-foreground">{quiz.description}</p>
          )}
          <Progress
            value={((currentIndex + 1) / total) * 100}
            className="h-1.5 mt-2"
          />
        </CardHeader>
      </Card>

      {/* Question */}
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6 space-y-5">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <HelpCircle className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-base font-medium leading-relaxed">
                {current.text}
              </p>
              {current.imageUrl && (
                <div className="mt-3 rounded-lg overflow-hidden border bg-muted/30">
                  <img
                    src={current.imageUrl}
                    alt="Question"
                    className="max-h-64 object-contain mx-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Choices */}
          <div className="space-y-2">
            {current.choices.map((choice) => {
              const isSelected = selected.includes(choice.id);
              const isCorrectChoice = correctIds.includes(choice.id);

              let borderClass = "border-border hover:border-primary/50";
              let bgClass = "hover:bg-accent/30";

              if (isRevealed) {
                if (isCorrectChoice) {
                  borderClass = "border-emerald-500";
                  bgClass = "bg-emerald-50 dark:bg-emerald-950/30";
                } else if (isSelected && !isCorrectChoice) {
                  borderClass = "border-red-500";
                  bgClass = "bg-red-50 dark:bg-red-950/30";
                }
              } else if (isSelected) {
                borderClass = "border-primary";
                bgClass = "bg-primary/5";
              }

              return (
                <button
                  key={choice.id}
                  onClick={() => toggleChoice(current.id, choice.id)}
                  disabled={isRevealed}
                  className={`w-full flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${borderClass} ${bgClass} ${
                    isRevealed ? "cursor-default" : "cursor-pointer"
                  }`}
                >
                  <div
                    className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/40"
                    } ${
                      isRevealed && isCorrectChoice
                        ? "!border-emerald-500 !bg-emerald-500 !text-white"
                        : ""
                    } ${
                      isRevealed && isSelected && !isCorrectChoice
                        ? "!border-red-500 !bg-red-500 !text-white"
                        : ""
                    }`}
                  >
                    {isRevealed && isCorrectChoice ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : isRevealed && isSelected && !isCorrectChoice ? (
                      <XCircle className="h-4 w-4" />
                    ) : null}
                  </div>
                  <span className="text-sm flex-1">{choice.text}</span>
                  {isRevealed && isCorrectChoice && (
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 border-0 text-[10px]">
                      Correct
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="cursor-pointer"
            >
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {!isRevealed && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => revealAnswer(current.id)}
                  disabled={selected.length === 0}
                  className="cursor-pointer"
                >
                  Check Answer
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleNext}
                className="cursor-pointer"
              >
                {currentIndex === total - 1 ? "Finish" : "Next"}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      {quiz.tags && quiz.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {quiz.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
