import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Trophy,
  Loader2,
  AlertCircle,
  ExternalLink,
  Play,
  BookOpen,
  ArrowLeft,
  Gauge,
  Link as LinkIcon,
  Youtube,
  GraduationCap,
  FileEdit,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import ShareButton from "@/shared/ui/ShareButton";
import SEO from "@/shared/components/seo/SEO";
import SmartPagination from "@/shared/components/pagination/SmartPagination";
import { fetchCourseInfo, fetchCourseById } from "@/features/courses/api";
import { fetchProductCoursesByAcademic } from "@/features/product-courses/api";
import ProductCourseCard from "@/features/product-courses/components/ProductCourseCard";
import type {
  CourseInfo,
  CourseResource,
  ResourceType,
  CourseApiResponse,
} from "@/features/courses/types";
import type { ProductCourseSummary } from "@/features/product-courses/types";

// Helper function to extract YouTube video ID
const getYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// YouTube Embed Component
const YouTubeEmbed = ({
  url,
  title,
  compact = false,
  watchButtonText = "Watch Video",
}: {
  url: string;
  title?: string;
  compact?: boolean;
  watchButtonText?: string;
}) => {
  const videoId = getYouTubeVideoId(url);

  if (!videoId) {
    return (
      <Button className="w-full" onClick={() => window.open(url, "_blank")}>
        <Play className="h-4 w-4 me-2" />
        {watchButtonText}
      </Button>
    );
  }

  return (
    <div
      className={`relative w-full rounded-lg overflow-hidden shadow-lg border-2 border-primary/20 hover:border-primary/40 transition-colors ${
        compact ? "aspect-video max-h-[180px]" : "aspect-video"
      }`}
    >
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title || "Video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
};

// Resource type display configuration
const RESOURCE_TYPE_CONFIG: Record<
  ResourceType,
  { label: string; icon: typeof Youtube; color: string }
> = {
  ECampusCourse: {
    label: "ECampus Course",
    icon: GraduationCap,
    color: "bg-primary",
  },
  YouTubeVideo: { label: "YouTube Video", icon: Youtube, color: "bg-red-500" },
  YouTubePlaylist: {
    label: "YouTube Playlist",
    icon: Youtube,
    color: "bg-red-600",
  },
  Article: { label: "Article", icon: FileEdit, color: "bg-green-500" },
  BlogPost: { label: "Blog Post", icon: FileEdit, color: "bg-green-600" },
  UdemyCourse: {
    label: "Udemy Course",
    icon: GraduationCap,
    color: "bg-secondary",
  },
  CourseraCourse: {
    label: "Coursera Course",
    icon: GraduationCap,
    color: "bg-primary/90",
  },
  EdXCourse: {
    label: "edX Course",
    icon: GraduationCap,
    color: "bg-secondary/90",
  },
  LinkedInLearning: {
    label: "LinkedIn Learning",
    icon: GraduationCap,
    color: "bg-secondary/80",
  },
  PluralSight: {
    label: "Pluralsight",
    icon: GraduationCap,
    color: "bg-pink-500",
  },
  OtherPlatformCourse: {
    label: "Online Course",
    icon: Layers,
    color: "bg-gray-500",
  },
  Other: { label: "Resource", icon: LinkIcon, color: "bg-gray-600" },
};

// Difficulty level configuration
const DIFFICULTY_CONFIG = {
  Easy: {
    label: "Easy",
    color: "bg-green-500 text-white",
    textColor: "text-green-600",
  },
  Moderate: {
    label: "Moderate",
    color: "bg-yellow-500 text-white",
    textColor: "text-yellow-600",
  },
  Hard: {
    label: "Hard",
    color: "bg-red-500 text-white",
    textColor: "text-red-600",
  },
};

// Resource Card Component
const ResourceCard = ({
  resource,
  t,
}: {
  resource: CourseResource;
  t: (key: string) => string;
}) => {
  const config =
    RESOURCE_TYPE_CONFIG[resource.type] || RESOURCE_TYPE_CONFIG.Other;
  const IconComponent = config.icon;
  const isECampus = resource.type === "ECampusCourse";

  return (
    <Card
      className={`group overflow-hidden transition-all duration-300 hover:shadow-xl ${
        isECampus
          ? "border-2 border-primary/50 bg-linear-to-br from-primary/5 via-background to-background dark:from-primary/10 dark:via-background dark:to-background"
          : "hover:border-primary/50 border"
      }`}
    >
      <CardContent className="p-0">
        {/* Header section */}
        <div
          className={`p-3 sm:p-4 ${
            isECampus
              ? "bg-linear-to-r from-primary/10 via-primary/5 to-transparent"
              : "bg-linear-to-r from-muted/50 to-transparent"
          }`}
        >
          <div className="flex items-start gap-2 sm:gap-3">
            {/* Icon */}
            <div
              className={`flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg ${
                config.color
              } shadow-md transition-transform duration-300 group-hover:scale-105 ${
                isECampus ? "ring-2 ring-primary/50 ring-offset-2" : ""
              }`}
            >
              <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>

            {/* Title & Badge */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-xs sm:text-sm line-clamp-1 group-hover:text-primary transition-colors">
                  {resource.title}
                </h4>
                {isECampus && (
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0 animate-pulse" />
                )}
              </div>
              <Badge
                variant="secondary"
                className={`text-[10px] sm:text-xs ${
                  isECampus ? "bg-primary text-white hover:bg-primary/90" : ""
                }`}
              >
                {config.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Content section */}
        <div className="px-3 sm:px-4 py-2 sm:py-3 space-y-2 sm:space-y-3">
          {resource.description && (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
              {resource.description}
            </p>
          )}

          {/* Demo Video Frame - Compact */}
          {resource.hasDemonstrationVideo && resource.demonstrationVideoUrl && (
            <div className="space-y-1 sm:space-y-1.5">
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Play className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                {t("courses.info.demoPreview")}
              </p>
              <YouTubeEmbed
                url={resource.demonstrationVideoUrl}
                title={`${resource.title} - Demo`}
                compact
                watchButtonText={t("courses.info.watchVideo")}
              />
            </div>
          )}
        </div>

        {/* Action button - Full width at bottom */}
        <div className="p-3 sm:p-4 pt-0">
          <Button
            variant={isECampus ? "default" : "outline"}
            className={`w-full justify-center gap-2 font-medium transition-all text-xs sm:text-sm h-8 sm:h-9 md:h-10 ${
              isECampus
                ? "bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl"
                : "border-2 hover:border-primary hover:bg-primary hover:text-primary-foreground"
            }`}
            onClick={() => window.open(resource.url, "_blank")}
          >
            <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {isECampus
              ? t("courses.info.openECampus")
              : t("courses.info.visitResource")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const CourseInfoPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null);
  const [course, setCourse] = useState<CourseApiResponse | null>(null);
  const [productCourses, setProductCourses] = useState<ProductCourseSummary[]>(
    [],
  );
  const [loadingProductCourses, setLoadingProductCourses] = useState(false);
  const [productCoursesPage, setProductCoursesPage] = useState(1);
  const [productCoursesPageSize] = useState(4);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    const loadData = async () => {
      if (!courseId) {
        setError("Course ID is required");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [infoResponse, courseResponse] = await Promise.all([
          fetchCourseInfo(parseInt(courseId)),
          fetchCourseById(parseInt(courseId)),
        ]);
        setCourseInfo(infoResponse);
        setCourse(courseResponse);
      } catch (err) {
        console.error("Failed to fetch course info:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load course information",
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [courseId]);

  // Load product courses when course data is available
  useEffect(() => {
    const loadProductCourses = async () => {
      if (!course) return;

      setLoadingProductCourses(true);
      try {
        const courses = await fetchProductCoursesByAcademic(course.id);
        setProductCourses(courses);
      } catch (err) {
        console.error("Failed to fetch product courses:", err);
        // Don't set error state, this is optional
        setProductCourses([]);
      } finally {
        setLoadingProductCourses(false);
      }
    };

    loadProductCourses();
  }, [course]);

  const difficultyConfig = courseInfo?.difficultyLevel
    ? DIFFICULTY_CONFIG[courseInfo.difficultyLevel]
    : null;

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <SEO
        title={
          course
            ? `${course.courseName} - ${t("courses.info.title")}`
            : t("courses.info.title")
        }
        description={courseInfo?.description || t("courses.info.description")}
      />
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        {/* Back Button & Share */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <Button
            variant="ghost"
            className="-ms-2 text-xs sm:text-sm h-8 sm:h-9"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 me-1.5 sm:me-2" />
            {t("common.buttons.back")}
          </Button>
          {course && (
            <ShareButton
              url={window.location.href}
              title={`${course.courseName} - ${t("courses.info.title")}`}
              variant="outline"
              size="sm"
            />
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 gap-2 sm:gap-3">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("courses.info.loading")}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="p-8 sm:p-12 bg-linear-to-br from-destructive/5 to-destructive/10 border-destructive/20">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-destructive/10 mb-3 sm:mb-4">
                <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-destructive" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2 text-destructive">
                {t("courses.info.errorTitle")}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mb-3 sm:mb-4">
                {error}
              </p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="text-xs sm:text-sm h-8 sm:h-9"
              >
                {t("common.buttons.tryAgain")}
              </Button>
            </div>
          </Card>
        )}

        {/* Content */}
        {!loading && !error && courseInfo && course && (
          <div className="space-y-4 sm:space-y-6">
            {/* Header Card */}
            <Card className="overflow-hidden border-2">
              <div className="bg-linear-to-r from-primary/10 via-primary/5 to-transparent p-4 sm:p-6 md:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
                  {/* Course Title & Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 flex-wrap">
                      <Badge
                        variant="secondary"
                        className="font-mono text-xs sm:text-sm"
                      >
                        {course.courseCode}
                      </Badge>
                      {difficultyConfig && (
                        <Badge
                          className={`${difficultyConfig.color} text-[10px] sm:text-xs`}
                        >
                          <Gauge className="h-2.5 w-2.5 sm:h-3 sm:w-3 me-1" />
                          {difficultyConfig.label}
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className="text-[10px] sm:text-xs"
                      >
                        {course.credits} {t("courses.info.credits")}
                      </Badge>
                    </div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1.5 sm:mb-2">
                      {course.courseName}
                    </h1>
                    {courseInfo.description && (
                      <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl">
                        {courseInfo.description}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 sm:gap-3 shrink-0 flex-wrap lg:flex-nowrap">
                    <Button
                      variant="outline"
                      className="transition-all hover:shadow-lg text-xs sm:text-sm h-8 sm:h-9 md:h-10"
                      onClick={() => navigate(`/courses/${courseId}/materials`)}
                    >
                      <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 me-1.5 sm:me-2" />
                      {t("courses.card.materials")}
                      <Badge
                        variant="secondary"
                        className="ms-1.5 sm:ms-2 text-[10px] sm:text-xs"
                      >
                        {course.numberOfMaterials}
                      </Badge>
                    </Button>
                    <Button
                      variant="outline"
                      className="transition-all hover:shadow-lg text-xs sm:text-sm h-8 sm:h-9 md:h-10"
                      onClick={() => navigate(`/courses/${courseId}/quizzes`)}
                    >
                      <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 me-1.5 sm:me-2" />
                      {t("courses.card.quizzes")}
                      <Badge
                        variant="secondary"
                        className="ms-1.5 sm:ms-2 text-[10px] sm:text-xs"
                      >
                        {course.numberOfQuizzes}
                      </Badge>
                    </Button>
                    <Button
                      variant="default"
                      className="transition-all hover:shadow-lg text-xs sm:text-sm h-8 sm:h-9 md:h-10 bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                      onClick={() =>
                        navigate(
                          `/browse/product-courses?academicCourseId=${courseId}`,
                        )
                      }
                    >
                      <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4 me-1.5 sm:me-2" />
                      {t("courses.card.proLearning", "Pro Learning")}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Demonstration Video */}
            {courseInfo.demonstrationVideoUrl && (
              <Card className="overflow-hidden border-2 border-primary/20">
                <CardHeader className="bg-linear-to-r from-primary/10 via-primary/5 to-transparent py-3 sm:py-4">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
                    <Play className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    {t("courses.info.overviewVideo")}
                  </CardTitle>
                  {courseInfo.demonstrationVideoTitle && (
                    <p className="text-xs sm:text-sm text-muted-foreground font-normal mt-0.5 sm:mt-1">
                      {courseInfo.demonstrationVideoTitle}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-3 sm:pt-4 pb-4 sm:pb-5">
                  <div className="max-w-2xl mx-auto">
                    <YouTubeEmbed
                      url={courseInfo.demonstrationVideoUrl}
                      title={
                        courseInfo.demonstrationVideoTitle ||
                        t("courses.info.overviewVideo")
                      }
                      watchButtonText={t("courses.info.watchVideo")}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pro Learning Courses Section */}
            {productCourses && productCourses.length > 0 && (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg md:text-xl font-semibold flex items-center gap-1.5 sm:gap-2">
                    <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    {t("courses.info.proLearning", "Pro Learning Courses")}
                    <Badge
                      variant="secondary"
                      className="ms-1 text-[10px] sm:text-xs"
                    >
                      {productCourses.length}
                    </Badge>
                  </h2>
                </div>

                <Separator />

                {loadingProductCourses ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {t("common.loading", "Loading courses...")}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {productCourses
                        .slice(
                          (productCoursesPage - 1) * productCoursesPageSize,
                          productCoursesPage * productCoursesPageSize,
                        )
                        .map((productCourse) => (
                          <ProductCourseCard
                            key={productCourse.id}
                            course={productCourse}
                            onEnrollSuccess={() => {
                              // Optionally refresh product courses if needed
                            }}
                          />
                        ))}
                    </div>

                    {Math.ceil(productCourses.length / productCoursesPageSize) >
                      1 && (
                      <SmartPagination
                        pageNumber={productCoursesPage}
                        totalPages={Math.ceil(
                          productCourses.length / productCoursesPageSize,
                        )}
                        hasPreviousPage={productCoursesPage > 1}
                        hasNextPage={
                          productCoursesPage <
                          Math.ceil(
                            productCourses.length / productCoursesPageSize,
                          )
                        }
                        onPageChange={(page) => {
                          setProductCoursesPage(page);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      />
                    )}
                  </>
                )}
              </div>
            )}

            {/* Resources Section */}
            {courseInfo.resources && courseInfo.resources.length > 0 && (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg md:text-xl font-semibold flex items-center gap-1.5 sm:gap-2">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    {t("courses.info.learningResources")}
                    <Badge
                      variant="secondary"
                      className="ms-1 text-[10px] sm:text-xs"
                    >
                      {
                        courseInfo.resources.filter(
                          (r) => r.type !== "ECampusCourse",
                        ).length
                      }
                    </Badge>
                  </h2>
                </div>

                <Separator />

                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                  {courseInfo.resources
                    .filter((resource) => resource.type !== "ECampusCourse")
                    .map((resource) => (
                      <ResourceCard
                        key={resource.id}
                        resource={resource}
                        t={t}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* No Resources State */}
            {(!courseInfo.resources || courseInfo.resources.length === 0) && (
              <Card className="p-8 sm:p-12 bg-linear-to-br from-card to-muted/20">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-primary/10 mb-3 sm:mb-4">
                    <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">
                    {t("courses.info.noResourcesTitle")}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
                    {t("courses.info.noResourcesDescription")}
                  </p>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseInfoPage;
