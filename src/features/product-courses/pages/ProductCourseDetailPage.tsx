import { useState, useEffect } from "react";
import {
  useParams,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import SEO from "@/shared/components/seo/SEO";
import StructuredData from "@/shared/components/seo/StructuredData";
import {
  ArrowLeft,
  Loader2,
  BookOpen,
  Calendar,
  Play,
  CheckCircle,
  ListTree,
  Sparkles,
  GraduationCap,
  CirclePlay,
  Award,
  BadgeCheck,
  Download,
  ExternalLink,
  PartyPopper,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  useProductCourse,
  useCourseOutline,
  useCourseContent,
} from "../hooks/useProductCourses";
import {
  useMyEnrollments,
  useCompleteLesson,
  useMyCertificates,
} from "../hooks/useEnrollment";
import { useAuth } from "@/app/providers/useAuth";
import CourseOutline from "../components/CourseOutline";
import CourseContentView from "../components/CourseContentView";
import ConfettiOverlay from "../components/ConfettiOverlay";
import EnrollButton from "../components/EnrollButton";
import VideoPlayer from "../components/VideoPlayer";
import { useLessonContent } from "../hooks/useLessonContent";
import type {
  LessonOutlineDto,
  CourseContentLessonDto,
  ProductCourseSummary,
} from "../types";
import { LessonType } from "../types";

const ProductCourseDetailPage = () => {
  const { slug: _slug, id } = useParams<{ slug: string; id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  // Course summary passed from the catalog card via navigation state
  const courseSummary = (
    location.state as { courseSummary?: ProductCourseSummary } | null
  )?.courseSummary;

  const courseId = id ? parseInt(id) : undefined;
  const { course, loading: courseLoading } = useProductCourse(courseId);
  const { outline, loading: outlineLoading } = useCourseOutline(courseId);

  // Fallback values from catalog card (since detail API may not include instructor info)
  const instructorName =
    course?.instructorName || courseSummary?.instructorName || null;
  const instructorPicture =
    course?.instructorProfilePictureUrl ||
    courseSummary?.instructorProfilePictureUrl ||
    null;
  const lessonCount = course?.lessonCount || courseSummary?.lessonCount || 0;

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  // Check if user is already enrolled (from external sources first)
  const { items: enrollments, refetch: refetchEnrollments } = useMyEnrollments(
    isAuthenticated ? 1 : 0,
    isAuthenticated ? 200 : 0,
  );
  const enrolledFromList = courseId
    ? (enrollments ?? []).some((e) => e.productCourseId === courseId)
    : false;
  const isEnrolled = enrolledFromList || !!courseSummary?.isEnrolled;

  // Course content (fetched on demand — uses enrolled-content endpoint when enrolled)
  const [showContent, setShowContent] = useState(false);
  const {
    content: courseContent,
    loading: contentLoading,
    refetch: refetchContent,
  } = useCourseContent(showContent ? courseId : undefined, isEnrolled);

  // Also consider courseContent.isEnrolled as a source of truth
  const isEnrolledFinal = isEnrolled || !!courseContent?.isEnrolled;

  // Auto-show content if tab=content query param OR if user is enrolled
  useEffect(() => {
    if (searchParams.get("tab") === "content") {
      setShowContent(true);
    }
  }, [searchParams]);

  // Auto-show content for enrolled users
  useEffect(() => {
    if (isEnrolledFinal) {
      setShowContent(true);
    }
  }, [isEnrolledFinal]);

  // Video preview modal
  const [previewVideoId, setPreviewVideoId] = useState<number | null>(null);
  const [previewLessonTitle, setPreviewLessonTitle] = useState("");

  // Trial video state
  const [showTrialVideo, setShowTrialVideo] = useState(false);

  // Enrollment prompt
  const [showEnrollPrompt, setShowEnrollPrompt] = useState(false);

  // Certificate celebration state
  const [showCongrats, setShowCongrats] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { certificates, refetch: refetchCertificates } = useMyCertificates();

  // Lesson content viewer
  const {
    content: lessonContent,
    loading: lessonContentLoading,
    error: lessonContentError,
    fetchContent: fetchLessonContent,
    clear: clearLessonContent,
  } = useLessonContent();
  const [selectedLesson, setSelectedLesson] =
    useState<CourseContentLessonDto | null>(null);
  const [autoOpenDone, setAutoOpenDone] = useState(false);

  // Auto-open the next incomplete lesson when enrolled content loads
  useEffect(() => {
    if (!isEnrolledFinal || !courseContent || autoOpenDone) return;

    // Flatten all lessons in order
    const allLessons = [...courseContent.topics]
      .sort((a, b) => a.order - b.order)
      .flatMap((t) => [...t.lessons].sort((a, b) => a.order - b.order));

    // Find the first lesson that is NOT completed and NOT locked
    const nextLesson = allLessons.find((l) => !l.isCompleted && !l.isLocked);

    if (nextLesson) {
      setSelectedLesson(nextLesson);
      if (nextLesson.type !== LessonType.ExternalVideo) {
        fetchLessonContent(nextLesson.id, nextLesson.type);
      }
    }
    setAutoOpenDone(true);
  }, [isEnrolledFinal, courseContent, autoOpenDone, fetchLessonContent]);

  const loading = courseLoading || outlineLoading;

  const handleFreePreviewClick = async (lesson: LessonOutlineDto) => {
    if (lesson.type === LessonType.Video) {
      setPreviewLessonTitle(lesson.title);
      setPreviewVideoId(lesson.id);
    }
  };

  const handleLockedClick = () => {
    setShowEnrollPrompt(true);
  };

  const handleShowContent = () => {
    setShowContent(true);
  };

  const handleContentLessonClick = (lesson: CourseContentLessonDto) => {
    if (lesson.isLocked) return;

    // Toggle: clicking the same lesson closes it
    if (selectedLesson?.id === lesson.id) {
      handleCloseLessonContent();
      return;
    }

    setSelectedLesson(lesson);
    // ExternalVideo: directUrl already present in lesson object — no API call needed
    if (lesson.type !== LessonType.ExternalVideo) {
      fetchLessonContent(lesson.id, lesson.type);
    }
  };

  const handleCloseLessonContent = () => {
    setSelectedLesson(null);
    clearLessonContent();
  };

  const handleRetryLessonContent = () => {
    if (selectedLesson) {
      fetchLessonContent(selectedLesson.id, selectedLesson.type);
    }
  };

  // Mark lesson as completed
  const { complete: completeLessonAction, loading: completeLessonLoading } =
    useCompleteLesson();

  const handleMarkCompleted = async (lessonId: number) => {
    const enrollmentId = courseContent?.enrollmentId;
    if (!enrollmentId) return;

    try {
      await completeLessonAction(enrollmentId, lessonId);

      // Detect if this was the last lesson (course will be 100% after this)
      const willBeComplete =
        courseContent &&
        courseContent.completedLessons + 1 >= courseContent.totalLessons;

      // Move to the next accessible lesson
      if (courseContent) {
        const allLessons = [...courseContent.topics]
          .sort((a, b) => a.order - b.order)
          .flatMap((t) => [...t.lessons].sort((a, b) => a.order - b.order));

        const currentIdx = allLessons.findIndex((l) => l.id === lessonId);
        const nextLesson = allLessons
          .slice(currentIdx + 1)
          .find((l) => !l.isLocked);

        if (nextLesson) {
          setSelectedLesson(nextLesson);
          if (nextLesson.type !== LessonType.ExternalVideo) {
            fetchLessonContent(nextLesson.id, nextLesson.type);
          }
        } else {
          // Last lesson — close the viewer
          handleCloseLessonContent();
        }
      }

      // Refetch content to get updated completion status
      await refetchContent();

      // If course just completed → celebrate!
      if (willBeComplete) {
        setShowCongrats(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5500);
        // Fetch certificates (backend auto-generates one)
        await refetchCertificates();
        // Poll once more for PDF generation
        setTimeout(() => {
          void refetchCertificates();
        }, 2500);
      }
    } catch {
      // Error is logged inside the hook
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg font-medium">Course not found</p>
        <Button
          variant="outline"
          className="mt-4 cursor-pointer"
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </div>
    );
  }

  const trialVideoUrl = course.trialVideoUrl || outline?.trialVideoUrl || null;
  const isBunnyEmbed = (url: string) =>
    url.includes("iframe.mediadelivery.net") || url.includes("/embed/");

  return (
    <>
      <SEO
        title={`${course.title} | eCampus`}
        description={
          course.description ||
          t("seo.productCourseDetail.description").replace(
            "{{courseDescription}}",
            course.title,
          )
        }
        keywords={t("seo.productCourseDetail.keywords").replace(
          "{{courseName}}",
          course.title,
        )}
        image={course.thumbnailUrl || undefined}
        canonical={`https://ecampusjo.com/browse/product-courses/${course.id}/${course.slug || course.id}`}
      />
      <StructuredData
        type="course"
        data={{
          name: course.title,
          description: course.description || course.title,
          provider: course.instructorName || "eCampus",
          url: `https://ecampusjo.com/browse/product-courses/${course.id}/${course.slug || course.id}`,
          image: course.thumbnailUrl || undefined,
          price: course.price,
          priceCurrency: "JOD",
        }}
      />
      <div className="min-h-screen bg-background">
        {/* Hero Section - Only show for non-enrolled users */}
        {!isEnrolledFinal && (
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative container mx-auto px-4 py-8 max-w-6xl">
              <Button
                variant="ghost"
                className="mb-6 gap-2 cursor-pointer text-white/70 hover:text-white hover:bg-white/10"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Courses
              </Button>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left: Course info */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {isEnrolledFinal && (
                      <Badge className="bg-emerald-500/90 text-white border-0 gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Enrolled
                      </Badge>
                    )}
                    {course.isFree && (
                      <Badge className="bg-emerald-500/90 text-white border-0">
                        Free
                      </Badge>
                    )}
                    {course.categories.map((cat) => (
                      <Badge
                        key={cat}
                        variant="outline"
                        className="border-white/20 text-white/80"
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>

                  <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
                    {course.title}
                  </h1>

                  {course.description && (
                    <p className="text-white/70 text-base leading-relaxed max-w-2xl">
                      {course.description}
                    </p>
                  )}

                  {instructorName && (
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14 border-2 border-white/20 shadow-lg">
                        {instructorPicture ? (
                          <AvatarImage
                            src={instructorPicture}
                            alt={instructorName}
                          />
                        ) : null}
                        <AvatarFallback className="text-lg font-bold bg-white/15 text-white">
                          {getInitials(instructorName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white/50 text-xs">Created by</p>
                        <p className="text-white text-base font-semibold">
                          {instructorName}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-5 pt-2">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 text-white/60" />
                      <span className="font-semibold text-sm">
                        {course.lessonCount || lessonCount}
                      </span>
                      <span className="text-white/50 text-sm">lessons</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/50 text-sm">
                      <Calendar className="h-4 w-4" />
                      Last updated{" "}
                      {new Date(
                        course.updatedAt || course.createdAt,
                      ).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Right: Trial video or thumbnail */}
                <div className="lg:col-span-2">
                  {trialVideoUrl && !showTrialVideo ? (
                    <div
                      className="relative rounded-xl overflow-hidden shadow-2xl shadow-black/50 cursor-pointer group aspect-video bg-slate-900 ring-1 ring-white/10 hover:ring-primary/40 transition-all duration-300"
                      onClick={() => setShowTrialVideo(true)}
                    >
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="w-full h-full object-cover opacity-70 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-primary/25 via-slate-900 to-secondary/30" />
                      )}
                      {/* Gradient overlays */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-black/10" />
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Animated play button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative flex items-center justify-center">
                          {/* Outer ping */}
                          <div className="absolute w-32 h-32 rounded-full bg-white/10 animate-ping animation-duration-[3s]" />
                          {/* Middle ping */}
                          <div className="absolute w-24 h-24 rounded-full bg-primary/20 animate-ping animation-duration-[2.2s] animation-delay-[0.4s]" />
                          {/* Inner ping */}
                          <div className="absolute w-16 h-16 rounded-full bg-white/15 animate-ping animation-duration-[1.8s] animation-delay-[0.9s]" />
                          {/* Glow ring */}
                          <div className="absolute w-[76px] h-[76px] rounded-full ring-2 ring-white/30" />
                          {/* Play button */}
                          <div className="relative z-10 w-[72px] h-[72px] rounded-full bg-white flex items-center justify-center shadow-2xl shadow-black/60 group-hover:scale-110 group-hover:shadow-primary/60 transition-all duration-300">
                            <Play className="h-8 w-8 text-primary fill-primary ml-1" />
                          </div>
                        </div>
                      </div>

                      {/* FREE PREVIEW badge — top left */}
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-primary text-white border-0 text-[11px] font-bold shadow-lg shadow-primary/30 gap-1.5">
                          <Sparkles className="h-3 w-3" />
                          FREE PREVIEW
                        </Badge>
                      </div>

                      {/* Hover hint — bottom right */}
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-white/80 text-xs bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                          Click to play ▶
                        </span>
                      </div>
                    </div>
                  ) : trialVideoUrl && showTrialVideo ? (
                    <div className="rounded-xl overflow-hidden shadow-2xl shadow-black/40 aspect-video bg-black ring-1 ring-white/10 animate-in fade-in duration-500">
                      {isBunnyEmbed(trialVideoUrl) ? (
                        <iframe
                          src={trialVideoUrl}
                          title="Trial video preview"
                          className="w-full h-full border-0"
                          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={trialVideoUrl}
                          controls
                          autoPlay
                          className="w-full h-full"
                        />
                      )}
                    </div>
                  ) : course.thumbnailUrl ? (
                    <div className="rounded-xl overflow-hidden shadow-2xl shadow-black/40 aspect-video ring-1 ring-white/10">
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Back button for enrolled users */}
        {isEnrolledFinal && (
          <div className="border-b bg-muted/20">
            <div className="container mx-auto px-4 py-4 max-w-6xl">
              <Button
                variant="ghost"
                className="gap-2 cursor-pointer"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Courses
              </Button>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div
            className={`grid grid-cols-1 ${isEnrolledFinal ? "" : "lg:grid-cols-3"} gap-8`}
          >
            {/* Main content */}
            <div
              className={`${isEnrolledFinal ? "" : "lg:col-span-2"} space-y-8`}
            >
              {/* Course content view (fetched from /content API) */}
              {showContent && contentLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground text-sm">
                    Loading content...
                  </span>
                </div>
              )}

              {showContent && courseContent && (
                <CourseContentView
                  content={courseContent}
                  instructorName={instructorName}
                  instructorProfilePictureUrl={instructorPicture}
                  trialVideoUrl={trialVideoUrl}
                  onLessonClick={handleContentLessonClick}
                  activeLessonId={selectedLesson?.id ?? null}
                  selectedLesson={selectedLesson}
                  lessonContent={lessonContent}
                  lessonContentLoading={lessonContentLoading}
                  lessonContentError={lessonContentError}
                  onCloseLessonContent={handleCloseLessonContent}
                  onRetryLessonContent={handleRetryLessonContent}
                  onMarkCompleted={handleMarkCompleted}
                  markCompletedLoading={completeLessonLoading}
                  onShowCertificate={
                    courseContent?.isCompleted
                      ? () => setShowCongrats(true)
                      : undefined
                  }
                />
              )}

              {/* Course outline (shown when content is not active) */}
              {!showContent && outline && outline.topics.length > 0 && (
                <CourseOutline
                  topics={outline.topics}
                  onFreePreviewClick={handleFreePreviewClick}
                  onLockedClick={handleLockedClick}
                />
              )}

              {/* About section */}
              {course.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    About This Course
                  </h3>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {course.description}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar — only shown for non-enrolled users */}
            {!isEnrolledFinal && (
              <div className="space-y-4">
                <Card className="sticky top-20 shadow-lg border-0 bg-card">
                  <CardContent className="pt-6 space-y-5">
                    {/* Price */}
                    <div className="text-center">
                      {course.isFree ? (
                        <div>
                          <p className="text-3xl font-bold text-emerald-600">
                            Free
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Full access, no payment needed
                          </p>
                        </div>
                      ) : course.discountPercentage &&
                        course.discountedPrice != null ? (
                        <div>
                          <div className="flex items-center justify-center gap-2">
                            <p className="text-3xl font-bold text-primary">
                              {course.discountedPrice.toFixed(2)} JD
                            </p>
                            <Badge className="bg-primary/10 text-primary border-primary/20 border font-bold">
                              -{course.discountPercentage}%
                            </Badge>
                          </div>
                          <p className="text-base text-muted-foreground line-through mt-0.5">
                            {course.price.toFixed(2)} JD
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            One-time purchase
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-3xl font-bold">
                            {course.price.toFixed(2)} JD
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            One-time purchase
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    {isAuthenticated ? (
                      <div className="space-y-2">
                        <EnrollButton
                          course={course}
                          isEnrolled={false}
                          onEnrolled={() => {
                            refetchEnrollments();
                            refetchContent();
                          }}
                        />
                        <Button
                          variant="outline"
                          className="w-full cursor-pointer"
                          size="lg"
                          onClick={handleShowContent}
                        >
                          <ListTree className="h-4 w-4 mr-2" />
                          Show Content
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Button
                          className="w-full cursor-pointer"
                          size="lg"
                          onClick={() => navigate("/auth/login")}
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Login to Enroll
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full cursor-pointer"
                          size="lg"
                          onClick={handleShowContent}
                        >
                          <ListTree className="h-4 w-4 mr-2" />
                          Show Content
                        </Button>
                      </div>
                    )}

                    {/* Course info */}
                    <div className="space-y-3 text-sm pt-4 border-t">
                      {course.academicCourseName && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Academic Course
                          </span>
                          <span className="font-medium text-right max-w-[60%] truncate">
                            {course.academicCourseName}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Lessons</span>
                        <span className="font-medium">
                          {course.lessonCount || lessonCount}
                        </span>
                      </div>
                      {outline && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Topics</span>
                          <span className="font-medium">
                            {outline.topics.length}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Video preview modal */}
        <Dialog
          open={previewVideoId !== null}
          onOpenChange={(open) => !open && setPreviewVideoId(null)}
        >
          <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
            <DialogHeader className="px-6 pt-6 pb-2">
              <DialogTitle>{previewLessonTitle}</DialogTitle>
              <DialogDescription>Free preview lesson</DialogDescription>
            </DialogHeader>
            <div className="px-6 pb-6">
              {previewVideoId && <VideoPlayer videoId={previewVideoId} />}
            </div>
          </DialogContent>
        </Dialog>

        {/* Enrollment prompt dialog */}
        <Dialog open={showEnrollPrompt} onOpenChange={setShowEnrollPrompt}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enroll to Access</DialogTitle>
              <DialogDescription>
                This lesson is only available for enrolled students. Enroll in
                the course to access all lessons.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setShowEnrollPrompt(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              {isAuthenticated ? (
                <Button
                  className="cursor-pointer"
                  onClick={() => {
                    setShowEnrollPrompt(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Enroll Now
                </Button>
              ) : (
                <Button
                  className="cursor-pointer"
                  onClick={() => navigate("/auth/login")}
                >
                  Login to Enroll
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* 🎉 Course completion celebration dialog */}
        <Dialog open={showCongrats} onOpenChange={setShowCongrats}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <PartyPopper className="h-6 w-6 text-amber-500" />
                Congratulations! 🎉
              </DialogTitle>
              <DialogDescription>
                You've completed{" "}
                <span className="font-semibold text-foreground">
                  {course.title}
                </span>
                . Your certificate has been issued!
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center gap-5 py-2">
              <div className="relative">
                <div className="award-pop-in h-24 w-24 rounded-full bg-linear-to-br from-amber-100 to-amber-50 dark:from-amber-950/60 dark:to-amber-950/20 border-4 border-amber-300 dark:border-amber-700 flex items-center justify-center shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30">
                  <Award className="h-12 w-12 text-amber-500" />
                </div>
                <div className="absolute -top-1 -right-1 h-7 w-7 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center shadow-sm">
                  <BadgeCheck className="h-4 w-4 text-white" />
                </div>
              </div>

              <div className="text-center space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                  Certificate of Completion
                </p>
                <p className="font-bold text-base leading-snug">
                  {course.title}
                </p>
              </div>

              {(() => {
                const cert = courseContent?.certificateId
                  ? certificates.find(
                      (c) => c.id === courseContent.certificateId,
                    )
                  : certificates.length > 0
                    ? certificates[certificates.length - 1]
                    : null;
                const pdfUrl = cert?.pdfUrl;

                return pdfUrl ? (
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                    onClick={() => setShowCongrats(false)}
                  >
                    <Button
                      size="lg"
                      className="w-full gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/40"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open PDF Certificate
                    </Button>
                  </a>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-4 py-2.5 w-full justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="font-medium">
                      PDF is being generated…
                    </span>
                  </div>
                );
              })()}

              <div className="flex flex-col sm:flex-row gap-2 w-full">
                {courseContent?.certificateId ? (
                  <Button
                    className="flex-1 gap-2 cursor-pointer"
                    variant="outline"
                    onClick={() => {
                      setShowCongrats(false);
                      navigate(
                        `/certificates/${courseContent.certificateId}`,
                      );
                    }}
                  >
                    <Download className="h-4 w-4" />
                    View Certificate
                  </Button>
                ) : (
                  <Button
                    className="flex-1 gap-2 cursor-pointer"
                    variant="outline"
                    onClick={() => {
                      setShowCongrats(false);
                      navigate("/my-certificates");
                    }}
                  >
                    <Award className="h-4 w-4" />
                    My Certificates
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="flex-1 cursor-pointer text-muted-foreground"
                  onClick={() => setShowCongrats(false)}
                >
                  Keep Reviewing
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Full-screen confetti */}
        <ConfettiOverlay active={showConfetti} />
      </div>
    </>
  );
};

export default ProductCourseDetailPage;
