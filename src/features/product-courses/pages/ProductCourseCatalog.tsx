import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, GraduationCap, Check, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import SmartPagination from "@/shared/components/pagination/SmartPagination";
import {
  useProductCourseCatalog,
  useProductCoursesByAcademicPaginated,
} from "../hooks/useProductCourses";
import ProductCourseCard from "../components/ProductCourseCard";
import { useCallback } from "react";
import { useAuth } from "@/app/providers/useAuth";
import { Button } from "@/shared/ui/button";
import { fetchCourseById } from "@/features/courses/api";
import { useEffect } from "react";
import SEO from "@/shared/components/seo/SEO";

const ProductCourseCatalog = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const majorId = user?.majorId;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const academicCourseId = searchParams.get("academicCourseId");
  const [academicCourseName, setAcademicCourseName] = useState<string | null>(
    null,
  );

  const [isFree, setIsFree] = useState<boolean | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);

  // Fetch course name if academicCourseId is provided
  useEffect(() => {
    if (academicCourseId) {
      fetchCourseById(parseInt(academicCourseId))
        .then((course) => setAcademicCourseName(course.courseName))
        .catch(() => setAcademicCourseName(null));
    }
  }, [academicCourseId]);

  // Use appropriate hook based on whether academicCourseId is present
  const {
    items: courses,
    totalCount,
    totalPages,
    loading,
    refetch: refetchCatalog,
  } = academicCourseId
    ? useProductCoursesByAcademicPaginated(
        parseInt(academicCourseId),
        currentPage,
        pageSize,
      )
    : useProductCourseCatalog({
        pageNumber: currentPage,
        pageSize,
        isFree,
        majorId,
      });

  // Re-fetch catalog so isEnrolled flags are refreshed
  const handleEnrollSuccess = useCallback(() => {
    refetchCatalog();
  }, [refetchCatalog]);

  return (
    <>
      <SEO
        title={
          academicCourseName
            ? `${academicCourseName} | ${t("seo.productCourses.title")}`
            : t("seo.productCourses.title")
        }
        description={t("seo.productCourses.description")}
        keywords={t("seo.productCourses.keywords")}
        canonical="https://ecampusjo.com/browse/product-courses"
      />
      <div className="min-h-screen bg-background">
        {/* Hero section */}
        <div className="relative bg-linear-to-br from-primary/5 via-background to-secondary/5 border-b">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="relative container mx-auto px-4 py-12 max-w-7xl">
            {/* Title and Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {academicCourseId && (
                  <Button
                    variant="ghost"
                    className="mb-4 gap-2 cursor-pointer"
                    onClick={() => navigate(-1)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                )}
                <h1 className="text-3xl font-bold">Pro Learning Courses</h1>
                <p className="text-muted-foreground">
                  {academicCourseName
                    ? `Premium courses for ${academicCourseName}`
                    : "Premium courses with video lessons, quizzes & certificates"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Top bar with toggle and course count */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            {/* Free Courses Toggle - only show when not filtered by academic course */}
            {!academicCourseId && (
              <button
                onClick={() => {
                  setIsFree(isFree === true ? undefined : true);
                  setCurrentPage(1);
                }}
                type="button"
                className={`flex items-center gap-3 p-2 lg:pr-5 pr-4 rounded-full border transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/50 select-none ${
                  isFree === true
                    ? "bg-primary/5 border-primary/20"
                    : "bg-background border-border/50 hover:bg-muted/50 shadow-sm"
                }`}
              >
                <div
                  className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors shrink-0 ${
                    isFree === true ? "bg-primary" : "bg-muted-foreground/20"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                      isFree === true ? "translate-x-6" : "translate-x-1"
                    }`}
                  >
                    {isFree === true && (
                      <Check
                        className="h-2.5 w-2.5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        strokeWidth={4}
                      />
                    )}
                  </span>
                </div>
                <span
                  className={`text-sm font-medium ${isFree === true ? "text-primary" : "text-muted-foreground"}`}
                >
                  Show free courses only
                </span>
              </button>
            )}

            {/* Course count */}
            {!loading && (
              <p className="text-sm text-muted-foreground ml-auto">
                {totalCount} course{totalCount !== 1 ? "s" : ""} found
              </p>
            )}
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Loading courses...
              </p>
            </div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <div>
                <p className="text-lg font-medium">No courses found</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Try adjusting your search or filters.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8">
                {courses.map((course) => (
                  <ProductCourseCard
                    key={course.id}
                    course={course}
                    onEnrollSuccess={handleEnrollSuccess}
                  />
                ))}
              </div>
              {totalPages > 1 && (
                <SmartPagination
                  pageNumber={currentPage}
                  totalPages={totalPages}
                  hasPreviousPage={currentPage > 1}
                  hasNextPage={currentPage < totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductCourseCatalog;
