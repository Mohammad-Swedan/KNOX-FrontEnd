import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Trophy,
  Info,
  UserPlus,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import ShareButton from "@/shared/ui/ShareButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { apiClient } from "@/lib/api/apiClient";
import { useAuth } from "@/app/providers/useAuth";
import type { Course } from "../types";

type CourseCardProps = {
  course: Course;
  viewMode: "grid" | "list";
  onClick?: (courseId: number) => void;
};

export type { Course };

export default function CourseCard({
  course,
  viewMode,
  onClick,
}: CourseCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick(course.id);
    }
  };

  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      await apiClient.post(`/courses/${course.id}/enroll`, { notes: null });
      setIsEnrollDialogOpen(false);
      toast.success(t("courses.card.enrollSuccess"), {
        description: t("courses.card.enrollSuccessDescription"),
      });
    } catch (error) {
      console.error("Enrollment failed:", error);
      toast.error(t("courses.card.enrollFailed"), {
        description: t("courses.card.enrollFailedDescription"),
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  if (viewMode === "grid") {
    return (
      <Card
        className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer border hover:border-primary/50 bg-linear-to-br from-card via-card to-card/80 flex flex-col h-full"
        onClick={handleClick}
      >
        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-primary/10 via-primary/5 to-transparent rounded-bl-full transition-all duration-300 group-hover:from-primary/20 group-hover:scale-110" />

        {/* Header */}
        <CardHeader className="pb-3 relative space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Badge
              variant="secondary"
              className="shrink-0 font-mono text-xs transition-colors group-hover:bg-primary/20"
            >
              {course.code}
            </Badge>
            <div className="flex items-center gap-1">
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEnrollDialogOpen(true);
                  }}
                  title="Enroll in course"
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              )}
              <ShareButton
                url={`/courses/${course.id}`}
                title={`Check out ${course.name}`}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              />
            </div>
          </div>
          <CardTitle className="line-clamp-2 text-base leading-snug transition-colors duration-300 group-hover:text-primary">
            {course.name}
          </CardTitle>
        </CardHeader>

        {/* Content - grows to fill space */}
        <CardContent className="pt-0 flex-1 flex flex-col">
          {/* Major & Badges */}
          <div className="space-y-2 mb-3">
            <p className="text-xs text-muted-foreground font-medium">
              {course.major}
            </p>
            <div className="flex flex-wrap gap-1">
              {course.badges.map((badge, index) => (
                <Badge
                  key={index}
                  variant={badge === "Obligatory" ? "default" : "outline"}
                  className="text-xs py-0 h-5"
                >
                  {badge}
                </Badge>
              ))}
            </div>
          </div>

          {/* Stats - Compact inline */}
          <div className="flex items-center gap-3 sm:gap-4 py-2.5 sm:py-3 px-2.5 sm:px-3 rounded-lg bg-muted/50 mb-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              <span className="text-xs sm:text-sm font-semibold">
                {course.materials}
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                {t("courses.card.materials")}
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              <span className="text-xs sm:text-sm font-semibold">
                {course.quizzes}
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                {t("courses.card.quizzes")}
              </span>
            </div>
          </div>

          {/* Spacer to push buttons to bottom */}
          <div className="flex-1" />

          {/* Action Buttons - Always same structure */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-auto">
            <Button
              className="transition-all duration-200 hover:shadow-md text-[10px] sm:text-xs h-8 sm:h-9 cursor-pointer"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/courses/${course.id}/materials`);
              }}
            >
              <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 me-1" />
              {t("courses.card.viewMaterials")}
            </Button>
            <Button
              className="transition-all duration-200 hover:shadow-md text-[10px] sm:text-xs h-8 sm:h-9 cursor-pointer"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/courses/${course.id}/quizzes`);
              }}
            >
              <Trophy className="h-3 w-3 sm:h-3.5 sm:w-3.5 me-1" />
              {t("courses.card.viewQuizzes")}
            </Button>
            {course.hasCourseInfo && (
              <Button
                className="col-span-2 transition-all duration-200 hover:shadow-md text-[10px] sm:text-xs h-8 sm:h-9 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/courses/${course.id}/info`);
                }}
              >
                <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5 me-1" />
                {t("courses.card.viewDetails")}
              </Button>
            )}
            {course.hasProductCourse && (
              <Button
                className="col-span-2 relative overflow-hidden text-xs h-10 cursor-pointer bg-linear-to-r from-secondary via-secondary/90 to-primary text-white border-0 hover:shadow-lg hover:shadow-secondary/25 hover:scale-[1.02] transition-all duration-300"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/browse/product-courses`);
                }}
              >
                <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Pro Learning
              </Button>
            )}
          </div>
        </CardContent>

        {/* Enrollment Dialog */}
        <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>{t("courses.card.enrollInCourse")}</DialogTitle>
              <DialogDescription>
                {t("courses.card.enrollConfirmation")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEnrollDialogOpen(false);
                }}
                disabled={isEnrolling}
              >
                {t("common.buttons.cancel")}
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEnroll();
                }}
                disabled={isEnrolling}
              >
                {isEnrolling ? (
                  <>
                    <Loader2 className="h-4 w-4 me-2 animate-spin" />
                    {t("common.actions.loading")}
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 me-2" />
                    {t("courses.card.enroll")}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    );
  }

  // List View
  return (
    <Card
      className="group overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer border hover:border-primary/50 bg-linear-to-r from-card via-card to-card/80"
      onClick={handleClick}
    >
      <div className="flex flex-col lg:flex-row lg:items-center p-3 sm:p-4 md:p-5 gap-3 sm:gap-4">
        {/* Left: Course Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
            <Badge
              variant="secondary"
              className="shrink-0 font-mono text-[10px] sm:text-xs transition-colors group-hover:bg-primary/20"
            >
              {course.code}
            </Badge>
            <h3 className="text-sm sm:text-base md:text-lg font-semibold transition-colors duration-300 group-hover:text-primary line-clamp-1">
              {course.name}
            </h3>
            <div className="flex items-center gap-1">
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEnrollDialogOpen(true);
                  }}
                  title={t("courses.card.enroll")}
                >
                  <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              )}
              <ShareButton
                url={`/courses/${course.id}`}
                title={`Check out ${course.name}`}
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8"
              />
            </div>
          </div>

          <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 font-medium">
            {course.major}
          </p>

          <div className="flex flex-wrap gap-1 sm:gap-1.5">
            {course.badges.map((badge, index) => (
              <Badge
                key={index}
                variant={badge === "Obligatory" ? "default" : "outline"}
                className="text-[10px] sm:text-xs py-0 h-4 sm:h-5"
              >
                {badge}
              </Badge>
            ))}
          </div>
        </div>

        {/* Middle: Stats */}
        <div className="flex gap-4 sm:gap-6 lg:px-4 xl:px-6 lg:border-s lg:border-e border-border/50">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10 transition-all duration-300 group-hover:bg-primary/20">
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-xs sm:text-sm">
                {course.materials}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">
                {t("courses.card.materials")}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10 transition-all duration-300 group-hover:bg-primary/20">
              <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-xs sm:text-sm">
                {course.quizzes}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">
                {t("courses.card.quizzes")}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Buttons */}
        <div className="flex gap-1.5 sm:gap-2 shrink-0 flex-wrap lg:flex-nowrap">
          <Button
            className="transition-all duration-200 hover:shadow-md cursor-pointer text-[10px] sm:text-xs h-7 sm:h-8 md:h-9"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/courses/${course.id}/materials`);
            }}
          >
            <FileText className="me-1 sm:me-1.5 h-3 w-3 sm:h-4 sm:w-4" />
            {t("courses.card.materials")}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="transition-all duration-200 hover:shadow-md cursor-pointer text-[10px] sm:text-xs h-7 sm:h-8 md:h-9"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              navigate(`/courses/${course.id}/quizzes`);
            }}
          >
            <Trophy className="me-1 sm:me-1.5 h-3 w-3 sm:h-4 sm:w-4" />
            {t("courses.card.quizzes")}
          </Button>

          {course.hasCourseInfo && (
            <Button
              size="sm"
              className="transition-all duration-200 hover:shadow-md bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer text-[10px] sm:text-xs h-7 sm:h-8 md:h-9"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                navigate(`/courses/${course.id}/info`);
              }}
            >
              <Info className="me-1 sm:me-1.5 h-3 w-3 sm:h-4 sm:w-4" />
              {t("courses.card.viewDetails")}
            </Button>
          )}

          {course.hasProductCourse && (
            <Button
              size="sm"
              className="relative overflow-hidden cursor-pointer bg-linear-to-r from-secondary via-secondary/90 to-primary text-white border-0 hover:shadow-lg hover:shadow-secondary/25 transition-all duration-300"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                navigate(`/browse/product-courses`);
              }}
            >
              <Sparkles className="mr-1.5 h-4 w-4" />
              Pro Learning
            </Button>
          )}
        </div>
      </div>

      {/* Enrollment Dialog */}
      <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>{t("courses.card.enrollInCourse")}</DialogTitle>
            <DialogDescription>
              {t("courses.card.enrollConfirmation")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setIsEnrollDialogOpen(false);
              }}
              disabled={isEnrolling}
            >
              {t("common.buttons.cancel")}
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleEnroll();
              }}
              disabled={isEnrolling}
            >
              {isEnrolling ? (
                <>
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  {t("common.actions.loading")}
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 me-2" />
                  {t("courses.card.enroll")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
