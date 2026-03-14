import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  Pencil,
  Send,
  Image,
  Play,
  Loader2,
  CheckCircle,
  Zap,
  BadgeCheck,
  ListTree,
  Star,
  Users,
  GraduationCap,
  MessageCircle,
} from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/ui/avatar";
import { Input } from "@/shared/ui/input";
import {
  Dialog,
  DialogContent,
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
  Draft:
    "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-400/30",
  InReview: "bg-primary/15 text-primary border-primary/30",
  Published:
    "bg-green-500/15 text-green-700 dark:text-green-400 border-green-400/30",
  Archived:
    "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-400/30",
};

export default function ProductCourseCard({
  course,
  showManageActions = false,
  onPublish,
  onEnrollSuccess,
}: ProductCourseCardProps) {
  const isEnrolled = !!course.isEnrolled;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { enroll, loading: enrolling } = useEnroll();
  const [prepaidDialogOpen, setPrepaidDialogOpen] = useState(false);
  const [prepaidCode, setPrepaidCode] = useState("");

  const finalPrice = course.isFree
    ? t("productCourses.free")
    : `${(course.discountedPrice ?? course.price).toFixed(2)} JD`;
  // WhatsApp message is always in Arabic
  const whatsappEnrollMessage = `مرحباً! أرغب في الاشتراك في دورة: "${course.title}". السعر النهائي: ${finalPrice}. يرجى إرسال كود مسبق الدفع 🎓`;
  const whatsappEnrollLink = `https://wa.me/962795441474?text=${encodeURIComponent(whatsappEnrollMessage)}`;

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
        {/* Thumbnail — fixed 16:9 ratio (YouTube style), never distorts on resize */}
        <div className="relative aspect-video bg-linear-to-br from-muted to-muted/60 overflow-hidden">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/5 via-muted to-secondary/5">
              <Image className="h-10 w-10 text-muted-foreground/25" />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Trial video badge */}
          {course.trialVideoUrl && !showManageActions && (
            <div className="absolute bottom-2.5 left-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Badge className="bg-black/75 text-white border-0 text-[10px] font-medium gap-1 backdrop-blur-sm px-2 py-0.5">
                <Play className="h-2.5 w-2.5 fill-white" />
                Preview
              </Badge>
            </div>
          )}

          {/* Discount ribbon — top-left */}
          {!course.isFree &&
            course.discountPercentage &&
            course.discountedPrice != null && (
              <div className="absolute -top-1 -left-1 z-10">
                <div className="relative bg-linear-to-r from-rose-600 to-pink-500 text-white font-extrabold text-xs px-3 py-1 rounded-br-lg shadow-lg">
                  -{course.discountPercentage}% OFF
                  <div className="absolute bottom-0 left-0 w-0 h-0 border-l-4 border-l-transparent border-t-4 border-t-rose-800 -mb-1" />
                </div>
              </div>
            )}

          {/* Status badge (manage view) */}
          {showManageActions && (
            <Badge
              variant="outline"
              className={`absolute top-2.5 right-2.5 text-[10px] font-semibold backdrop-blur-sm ${statusColors[course.status] ?? ""}`}
            >
              {course.status}
            </Badge>
          )}

          {/* Enrolled badge */}
          {isEnrolled && !showManageActions && (
            <div className="absolute top-2.5 right-2.5">
              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white border-0 shadow-md text-[10px] font-semibold gap-1 px-1.5 py-0.5">
                <CheckCircle className="h-2.5 w-2.5" />
                Enrolled
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="pt-3.5 pb-4 px-4 flex-1 flex flex-col gap-2.5">
          {/* Title */}
          <div className="min-h-10">
            <h3 className="font-bold text-[15px] leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {course.title}
            </h3>
          </div>

          {/* Instructor */}
          {course.instructorName && (
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5 shrink-0">
                {course.instructorProfilePictureUrl ? (
                  <AvatarImage
                    src={course.instructorProfilePictureUrl}
                    alt={course.instructorName}
                  />
                ) : null}
                <AvatarFallback className="text-[9px] font-semibold bg-primary/10 text-primary">
                  {course.instructorName
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <p className="text-[11px] text-muted-foreground truncate">
                {course.instructorName}
              </p>
            </div>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-auto pt-1">
            {course.averageRating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-foreground">
                  {course.averageRating.toFixed(1)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              <span>{course.lessonCount} lessons</span>
            </div>
            {course.totalEnrollments > 0 && (
              <div className="flex items-center gap-1 ml-auto">
                <Users className="h-3 w-3" />
                <span>{course.totalEnrollments.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Price section — in card body */}
          <div className="flex items-end justify-between pt-1 border-t border-border/50">
            {course.isFree ? (
              <div className="flex items-center gap-2">
                <span className="text-base font-medium text-emerald-600 dark:text-emerald-400">
                  FREE
                </span>
                <Badge className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700 text-[10px] font-semibold px-1.5 py-0">
                  No cost
                </Badge>
              </div>
            ) : course.discountPercentage && course.discountedPrice != null ? (
              <div className="flex items-end gap-2">
                <span className="text-base font-medium text-primary leading-none">
                  {course.discountedPrice.toFixed(2)} JD
                </span>
                <span className="text-xs text-muted-foreground line-through leading-none mb-0.5">
                  {course.price.toFixed(2)} JD
                </span>
              </div>
            ) : (
              <span className="text-base font-medium text-foreground leading-none">
                {course.price.toFixed(2)} JD
              </span>
            )}
          </div>

          {/* Enrollment / CTA buttons */}
          {!showManageActions && (
            <div
              className="pt-1 space-y-2"
              onClick={(e) => e.stopPropagation()}
            >
              {isEnrolled ? (
                /* Enrolled: single "Show Content" button with enrolled accent */
                <Button
                  className="w-full cursor-pointer h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-sm"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(
                      `/browse/product-courses/${course.id}/${course.slug}?tab=content`,
                      {
                        state: { courseSummary: course },
                      },
                    );
                  }}
                >
                  <ListTree className="h-3.5 w-3.5 mr-1.5" />
                  Show Course Content
                </Button>
              ) : (
                /* Not enrolled: two buttons */
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    className="w-full cursor-pointer h-9 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground border-0"
                    size="sm"
                    onClick={handleEnrollClick}
                    disabled={enrolling}
                  >
                    {enrolling ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                    ) : (
                      <BadgeCheck className="h-3.5 w-3.5 mr-1" />
                    )}
                    Enroll Now
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full cursor-pointer h-9 text-xs font-semibold"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(
                        `/browse/product-courses/${course.id}/${course.slug}?tab=content`,
                        {
                          state: { courseSummary: course },
                        },
                      );
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

      {/* Enrollment CTA Dialog for paid courses */}
      <Dialog open={prepaidDialogOpen} onOpenChange={setPrepaidDialogOpen}>
        <DialogContent
          className="sm:max-w-[440px] p-0 overflow-hidden gap-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-linear-to-br from-primary/10 via-background to-secondary/10 px-6 pt-6 pb-5 border-b border-border/50">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-primary/15 p-3 shrink-0">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogHeader>
                  <DialogTitle className="text-base leading-snug text-start">
                    {t("productCourses.enrollCta.title")}
                  </DialogTitle>
                </DialogHeader>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {course.title}
                </p>
                {/* Price display */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {course.isFree ? (
                    <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      FREE
                    </span>
                  ) : course.discountedPrice != null ? (
                    <>
                      <span className="text-xl font-extrabold text-primary leading-none">
                        {course.discountedPrice.toFixed(2)} JD
                      </span>
                      <span className="text-sm text-muted-foreground line-through leading-none">
                        {course.price.toFixed(2)} JD
                      </span>
                      <span className="inline-flex items-center rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-[10px] font-bold px-1.5 py-0.5">
                        -{course.discountPercentage}%
                      </span>
                    </>
                  ) : (
                    <span className="text-xl font-extrabold text-primary leading-none">
                      {course.price.toFixed(2)} JD
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Body: code input */}
          <div className="px-6 py-5 space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">
                {t("productCourses.enrollCta.step2Title")}
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {t("productCourses.enrollCta.step2Desc")}
              </p>
              <Input
                className="h-10 text-sm"
                value={prepaidCode}
                onChange={(e) => setPrepaidCode(e.target.value)}
                placeholder={t("productCourses.enrollCta.codePlaceholder")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && prepaidCode.trim())
                    handlePrepaidEnroll();
                }}
                autoFocus
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] text-muted-foreground shrink-0">
                {t("productCourses.enrollCta.noCode")}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* WhatsApp CTA */}
            <a
              href={whatsappEnrollLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-green-400/50 bg-green-50/60 dark:bg-green-950/20 hover:bg-green-50 dark:hover:bg-green-950/40 hover:border-green-500/70 text-green-700 dark:text-green-400 px-4 py-2.5 text-xs font-bold transition-all hover:scale-[1.01] shadow-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <MessageCircle className="h-4 w-4 shrink-0" />
              {t("productCourses.enrollCta.getCode")}
            </a>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-0 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPrepaidDialogOpen(false);
                setPrepaidCode("");
              }}
              disabled={enrolling}
              className="cursor-pointer text-muted-foreground hover:text-foreground"
            >
              {t("productCourses.enrollCta.cancel")}
            </Button>
            <Button
              size="sm"
              onClick={handlePrepaidEnroll}
              disabled={enrolling || !prepaidCode.trim()}
              className="cursor-pointer bg-linear-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-bold shadow-md shadow-primary/20 transition-all hover:scale-[1.03]"
            >
              {enrolling ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  {t("common.actions.processing")}
                </>
              ) : (
                t("productCourses.enrollCta.enrollBtn")
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
