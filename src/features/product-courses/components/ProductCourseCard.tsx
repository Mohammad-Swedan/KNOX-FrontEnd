import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  BookOpen,
  Pencil,
  Send,
  Image,
  Play,
  Loader2,
  CheckCircle,
  Sparkles,
  ListTree,
} from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/ui/avatar";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/app/providers/useAuth";
import { useEnroll } from "../hooks/useEnrollment";
import type { ProductCourseSummary } from "../types";

interface ProductCourseCardProps {
  course: ProductCourseSummary;
  showManageActions?: boolean;
  onPublish?: (id: number) => void;
  onEnrollSuccess?: () => void;
}

const statusColors: Record<string, string> = {
  Draft: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-400/30",
  InReview: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-400/30",
  Published: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-400/30",
  Archived: "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-400/30",
};

export default function ProductCourseCard({
  course,
  showManageActions = false,
  onPublish,
  onEnrollSuccess,
}: ProductCourseCardProps) {
  const isEnrolled = !!course.isEnrolled;
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { enroll, loading: enrolling } = useEnroll();
  const [prepaidDialogOpen, setPrepaidDialogOpen] = useState(false);
  const [prepaidCode, setPrepaidCode] = useState("");

  const handleCardClick = () => {
    if (showManageActions) return;
    navigate(`/browse/product-courses/${course.id}/${course.slug}`, {
      state: { courseSummary: course },
    });
  };

  const handleEnrollClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }
    if (isEnrolled) {
      navigate(`/product-courses/${course.id}/learn`);
      return;
    }
    if (course.isFree) {
      try {
        await enroll(course.id);
        toast.success("Successfully enrolled!");
        onEnrollSuccess?.();
      } catch {
        toast.error("Failed to enroll. You may already be enrolled.");
      }
    } else {
      setPrepaidDialogOpen(true);
    }
  };

  const handlePrepaidEnroll = async () => {
    try {
      await enroll(course.id, prepaidCode.trim() || undefined);
      setPrepaidDialogOpen(false);
      setPrepaidCode("");
      toast.success("Successfully enrolled!");
      onEnrollSuccess?.();
    } catch {
      toast.error("Invalid code or enrollment failed.");
    }
  };

  return (
    <>
      <Card
        className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border flex flex-col h-full cursor-pointer ${
          isEnrolled
            ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300/60 dark:border-emerald-700/50 hover:border-emerald-400 ring-1 ring-emerald-200/40 dark:ring-emerald-800/30"
            : "bg-card hover:border-primary/30"
        }`}
        onClick={handleCardClick}
      >
        {/* Thumbnail */}
        <div className="relative h-44 bg-gradient-to-br from-muted to-muted/60 overflow-hidden">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 via-muted to-violet-500/5">
              <Image className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Trial video available badge */}
          {course.trialVideoUrl && !showManageActions && (
            <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Badge className="bg-black/70 text-white border-0 text-[10px] font-medium gap-1 backdrop-blur-sm">
                <Play className="h-2.5 w-2.5 fill-white" />
                Preview available
              </Badge>
            </div>
          )}

          {/* Price badge — top-left */}
          <div className="absolute top-3 left-3">
            {course.isFree ? (
              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white border-0 shadow-md text-xs font-semibold px-2.5 py-0.5">
                FREE
              </Badge>
            ) : (
              <Badge className="bg-slate-900/90 hover:bg-slate-900/90 text-white border-0 shadow-md font-bold text-xs px-2.5 py-0.5">
                ${course.price.toFixed(2)}
              </Badge>
            )}
          </div>

          {/* Status badge (manage view) */}
          {showManageActions && (
            <Badge
              variant="outline"
              className={`absolute top-3 right-3 text-[10px] font-semibold ${statusColors[course.status] ?? ""}`}
            >
              {course.status}
            </Badge>
          )}

          {/* Enrolled badge */}
          {isEnrolled && !showManageActions && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white border-0 shadow-md text-[10px] font-semibold gap-1 px-2 py-0.5">
                <CheckCircle className="h-3 w-3" />
                Enrolled
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="pt-4 pb-4 px-4 flex-1 flex flex-col gap-2.5">
          {/* Title */}
          <div className="min-h-[2.5rem]">
            <h3 className="font-semibold text-[15px] leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {course.title}
            </h3>
          </div>

          {/* Instructor */}
          {course.instructorName && (
            <div className="flex items-center gap-2.5">
              <Avatar className="h-7 w-7 shrink-0">
                {course.instructorProfilePictureUrl ? (
                  <AvatarImage src={course.instructorProfilePictureUrl} alt={course.instructorName} />
                ) : null}
                <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                  {course.instructorName
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <p className="text-xs text-muted-foreground truncate">
                {course.instructorName}
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto pt-1">
            <div className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{course.lessonCount} lessons</span>
            </div>
          </div>

          {/* Enrollment / CTA buttons */}
          {!showManageActions && (
            <div className="pt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
              {isEnrolled ? (
                /* Enrolled: single "Show Content" button with enrolled accent */
                <Button
                  className="w-full cursor-pointer h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-sm"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/browse/product-courses/${course.id}/${course.slug}?tab=content`, {
                      state: { courseSummary: course },
                    });
                  }}
                >
                  <ListTree className="h-3.5 w-3.5 mr-1.5" />
                  Show Course Content
                </Button>
              ) : (
                /* Not enrolled: two buttons */
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    className="w-full cursor-pointer h-9 text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 shadow-sm"
                    size="sm"
                    onClick={handleEnrollClick}
                    disabled={enrolling}
                  >
                    {enrolling ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 mr-1" />
                    )}
                    Enroll Now
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full cursor-pointer h-9 text-xs font-semibold"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/browse/product-courses/${course.id}/${course.slug}?tab=content`, {
                        state: { courseSummary: course },
                      });
                    }}
                  >
                    <ListTree className="h-3.5 w-3.5 mr-1" />
                    Show Content
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Manage actions */}
          {showManageActions && (
            <div
              className="grid grid-cols-2 gap-2 mt-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="outline"
                size="sm"
                className="text-xs cursor-pointer"
                onClick={() =>
                  navigate(`/dashboard/product-courses/${course.id}/lessons`)
                }
              >
                <BookOpen className="h-3.5 w-3.5 mr-1" />
                Lessons
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs cursor-pointer"
                onClick={() =>
                  navigate(`/dashboard/product-courses/${course.id}/edit`)
                }
              >
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
              {course.status === "Draft" && onPublish && (
                <Button
                  size="sm"
                  className="col-span-2 text-xs cursor-pointer"
                  onClick={() => onPublish(course.id)}
                >
                  <Send className="h-3.5 w-3.5 mr-1" />
                  Publish
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prepaid code dialog for paid courses */}
      <Dialog open={prepaidDialogOpen} onOpenChange={setPrepaidDialogOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Enroll in {course.title}</DialogTitle>
            <DialogDescription>
              This is a paid course. Enter your prepaid code to enroll.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor={`prepaid-${course.id}`}>Prepaid Code</Label>
              <Input
                id={`prepaid-${course.id}`}
                value={prepaidCode}
                onChange={(e) => setPrepaidCode(e.target.value)}
                placeholder="Enter your prepaid code"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && prepaidCode.trim()) {
                    handlePrepaidEnroll();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPrepaidDialogOpen(false)}
              disabled={enrolling}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePrepaidEnroll}
              disabled={enrolling || !prepaidCode.trim()}
              className="cursor-pointer"
            >
              {enrolling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enrolling...
                </>
              ) : (
                "Enroll"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
