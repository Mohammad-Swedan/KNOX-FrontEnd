import { useNavigate } from "react-router-dom";
import SEO from "@/shared/components/seo/SEO";
import {
  BookOpen,
  PlayCircle,
  Sparkles,
  RotateCcw,
  GraduationCap,
  Loader2,
  Star,
  Users,
  BookMarked,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { useEnrolledCourses } from "../hooks/useEnrollment";

const MyCoursesPage = () => {
  const navigate = useNavigate();
  const { courses, loading, error, refetch } = useEnrolledCourses();

  const totalCourses = courses.length;
  const totalLessons = courses.reduce(
    (acc, c) => acc + (c.lessonCount ?? 0),
    0,
  );
  const avgRating =
    totalCourses > 0
      ? (
          courses.reduce((acc, c) => acc + (c.averageRating ?? 0), 0) /
          totalCourses
        ).toFixed(1)
      : "0.0";

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <p className="text-muted-foreground animate-pulse">
          Loading your courses…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <RotateCcw className="h-7 w-7 text-destructive" />
        </div>
        <div>
          <p className="font-semibold text-lg">Something went wrong</p>
          <p className="text-muted-foreground text-sm mt-1">{error}</p>
        </div>
        <Button variant="outline" onClick={refetch} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 text-center px-4">
        <div className="relative">
          <div className="h-24 w-24 rounded-3xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-inner">
            <GraduationCap className="h-12 w-12 text-primary/60" />
          </div>
          <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-amber-400/20 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
        </div>
        <div className="max-w-sm">
          <h2 className="text-2xl font-bold mb-2">No courses yet</h2>
          <p className="text-muted-foreground leading-relaxed">
            You haven't enrolled in any courses. Browse our catalog and start
            learning today!
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => navigate("/browse/product-courses")}
          className="gap-2 rounded-full px-8 shadow-md hover:shadow-lg transition-shadow"
        >
          <BookOpen className="h-5 w-5" />
          Explore Courses
        </Button>
      </div>
    );
  }

  return (
    <>
      <SEO title="دوراتي | eCampus" noIndex={true} hreflang={false} />
      <div className="min-h-screen bg-background">
        {/* ── Hero / Header ─────────────────────────────── */}
        <div className="bg-linear-to-br from-primary/8 via-background to-background border-b border-border/40">
          <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium text-primary uppercase tracking-widest">
                    My Learning
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  My Courses
                </h1>
                <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                  Jump back in and keep learning.
                </p>
              </div>
              <Button
                onClick={() => navigate("/browse/product-courses")}
                variant="outline"
                className="self-start sm:self-auto gap-2 rounded-full border-primary/30 hover:border-primary/60 transition-colors"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                Browse More Courses
              </Button>
            </div>

            {/* ── Stat cards ──────────────────────────────── */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-8">
              {[
                {
                  icon: BookOpen,
                  label: "Enrolled Courses",
                  value: totalCourses,
                  color: "text-primary",
                  bg: "bg-primary/8",
                },
                {
                  icon: BookMarked,
                  label: "Total Lessons",
                  value: totalLessons,
                  color: "text-primary",
                  bg: "bg-primary/8",
                },
                {
                  icon: Star,
                  label: "Avg. Rating",
                  value: avgRating,
                  color: "text-amber-500",
                  bg: "bg-amber-500/8",
                },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}
                  >
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground leading-none mb-1">
                      {label}
                    </p>
                    <p className="text-xl font-bold leading-none">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Course List ──────────────────────────────────── */}
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid gap-4">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="group overflow-hidden border-border/40 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/product-courses/${course.id}/learn`)}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {/* ── Left accent bar ───────────────── */}
                    <div className="w-full sm:w-1.5 sm:h-auto h-1.5 shrink-0 rounded-t-lg sm:rounded-t-none sm:rounded-l-lg bg-primary/40 group-hover:bg-primary transition-colors duration-300" />

                    {/* ── Thumbnail ─────────────────────── */}
                    {course.thumbnailUrl && (
                      <div className="sm:w-40 sm:h-auto h-36 shrink-0 overflow-hidden">
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* ── Card body ─────────────────────── */}
                    <div className="flex-1 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold leading-snug text-foreground group-hover:text-primary transition-colors truncate">
                          {course.title}
                        </h3>
                        {course.instructorName && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {course.instructorName}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BookMarked className="h-3.5 w-3.5" />
                            {course.lessonCount} lessons
                          </span>
                          {(course.averageRating ?? 0) > 0 && (
                            <span className="flex items-center gap-1 text-amber-500">
                              <Star className="h-3.5 w-3.5 fill-amber-500" />
                              {course.averageRating?.toFixed(1)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {course.totalEnrollments?.toLocaleString()} enrolled
                          </span>
                        </div>
                      </div>

                      {/* ── CTA ───────────────────────────── */}
                      <div className="shrink-0">
                        <Button
                          size="sm"
                          className="gap-1.5 rounded-full px-5 shadow-sm hover:shadow-md transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product-courses/${course.id}/learn`);
                          }}
                        >
                          <PlayCircle className="h-3.5 w-3.5" />
                          Continue
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── Bottom CTA ────────────────────────────────── */}
          <div className="mt-12 rounded-3xl border border-dashed border-primary/30 bg-primary/4 p-8 text-center">
            <Sparkles className="h-8 w-8 text-primary/50 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-1">Ready for more?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Explore hundreds of courses and keep growing.
            </p>
            <Button
              onClick={() => navigate("/browse/product-courses")}
              className="gap-2 rounded-full px-8"
            >
              <BookOpen className="h-4 w-4" />
              Browse Catalog
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyCoursesPage;
