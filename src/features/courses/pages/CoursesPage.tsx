import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { LayoutGrid, List, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import CourseFilter from "@/features/courses/components/CourseFilter";
import SmartPagination from "@/shared/components/pagination/SmartPagination";
import { PageSizeSelector } from "@/shared/components/pagination/PageSizeSelector";
import CourseCard from "@/features/courses/components/CourseCard";
import SEO from "@/shared/components/seo/SEO";
import type { PaginatedResponse } from "@/lib/api/types";
import { useAuth } from "@/app/providers/useAuth";
import type { Course, CourseFilterValues } from "@/features/courses/types";
import { fetchCoursesByMajor } from "@/features/courses/api";

const CoursesPage = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coursesData, setCoursesData] =
    useState<PaginatedResponse<Course> | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<CourseFilterValues>({});

  const fetchCourses = useCallback(
    async (filters: CourseFilterValues, page: number, size: number) => {
      // If no major is selected, don't fetch
      if (!filters.majorId) {
        setCoursesData(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetchCoursesByMajor(
          filters.majorId,
          page,
          size,
          filters,
        );
        setCoursesData(response);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setError(
          err instanceof Error ? err.message : t("courses.page.failedToLoad"),
        );
        setCoursesData(null);
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  // Fetch courses when filters or pagination changes
  useEffect(() => {
    fetchCourses(appliedFilters, currentPage, pageSize);
  }, [appliedFilters, currentPage, pageSize, fetchCourses]);

  const handleCourseClick = (courseId: number) => {
    console.log(`Navigate to course ${courseId}`);
  };

  const handleApplyFilters = (filters: CourseFilterValues) => {
    setAppliedFilters(filters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleResetFilters = () => {
    setAppliedFilters({});
    setCurrentPage(1);
    setCoursesData(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentCourses = coursesData?.items || [];
  const totalCount = coursesData?.totalCount || 0;
  const totalPages = coursesData?.totalPages || 0;
  const hasPreviousPage = coursesData?.hasPreviousPage || false;
  const hasNextPage = coursesData?.hasNextPage || false;

  return (
    <>
      <SEO
        title={t("seo.courses.title")}
        description={t("seo.courses.description")}
        keywords={t("seo.courses.keywords")}
        url="https://uni-hub.com/courses"
      />
      <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
        {/* Filter */}
        <CourseFilter
          isLoggedIn={isAuthenticated}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />
        <div className="container mx-auto px-3 py-2 sm:px-4 md:px-6 lg:px-8">
          {/* Toolbar */}
          <div className="mb-2 flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <p className="text-xs sm:text-sm text-muted-foreground">
                {totalCount > 0 ? (
                  <>
                    {t("courses.page.showing")}{" "}
                    <span className="font-semibold text-foreground">
                      {(currentPage - 1) * pageSize + 1}-
                      {Math.min(currentPage * pageSize, totalCount)}
                    </span>{" "}
                    {t("courses.page.of")}{" "}
                    <span className="font-semibold text-foreground">
                      {totalCount}
                    </span>{" "}
                    {t("courses.page.courses")}
                  </>
                ) : (
                  t("courses.page.noCoursesToDisplay")
                )}
              </p>
              <PageSizeSelector pageSize={pageSize} onChange={setPageSize} />
            </div>

            <div className="flex items-center rounded-lg border p-1 bg-background shadow-sm self-start sm:self-auto">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-7 sm:h-8 px-2 sm:px-3"
                title={t("quizzes.toolbar.gridView")}
              >
                <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-7 sm:h-8 px-2 sm:px-3"
                title={t("quizzes.toolbar.listView")}
              >
                <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 gap-3">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t("courses.page.loadingCourses")}
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <Card className="p-6 sm:p-8 md:p-12 bg-linear-to-br from-destructive/5 to-destructive/10 border-destructive/20">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-destructive/10 mb-3 sm:mb-4">
                  <BookOpen className="h-7 w-7 sm:h-10 sm:w-10 text-destructive" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 text-destructive">
                  {t("courses.page.failedToLoad")}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mb-3 sm:mb-4 px-2">
                  {error}
                </p>
                <Button
                  onClick={() =>
                    fetchCourses(appliedFilters, currentPage, pageSize)
                  }
                  variant="outline"
                  size="sm"
                  className="text-sm"
                >
                  {t("courses.page.tryAgain")}
                </Button>
              </div>
            </Card>
          )}

          {/* Grid View */}
          {!loading &&
            !error &&
            viewMode === "grid" &&
            currentCourses.length > 0 && (
              <div className="grid gap-3 sm:gap-4 md:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {currentCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    viewMode="grid"
                    onClick={handleCourseClick}
                  />
                ))}
              </div>
            )}

          {/* List View */}
          {!loading &&
            !error &&
            viewMode === "list" &&
            currentCourses.length > 0 && (
              <div className="space-y-3 sm:space-y-4">
                {currentCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    viewMode="list"
                    onClick={handleCourseClick}
                  />
                ))}
              </div>
            )}

          {/* Empty State - No filters applied */}
          {!loading &&
            !error &&
            currentCourses.length === 0 &&
            !appliedFilters.majorId && (
              <Card className="p-6 sm:p-8 md:p-12 bg-linear-to-br from-card to-muted/20">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-primary/10 mb-3 sm:mb-4">
                    <BookOpen className="h-7 w-7 sm:h-10 sm:w-10 text-primary" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    {t("courses.page.selectFilters")}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-sm px-2">
                    {t("courses.page.selectFiltersDescription")}
                  </p>
                </div>
              </Card>
            )}

          {/* Empty State - Filters applied but no results */}
          {!loading &&
            !error &&
            currentCourses.length === 0 &&
            appliedFilters.majorId && (
              <Card className="p-6 sm:p-8 md:p-12 bg-linear-to-br from-card to-muted/20">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-primary/10 mb-3 sm:mb-4">
                    <BookOpen className="h-7 w-7 sm:h-10 sm:w-10 text-primary" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    {t("courses.page.noCoursesFound")}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-sm px-2">
                    {t("courses.page.noCoursesFoundDescription")}
                  </p>
                </div>
              </Card>
            )}

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="mt-6 sm:mt-8 flex justify-center">
              <SmartPagination
                pageNumber={currentPage}
                totalPages={totalPages}
                hasPreviousPage={hasPreviousPage}
                hasNextPage={hasNextPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CoursesPage;
