import { useState } from "react";
import {
  Search,
  Loader2,
  GraduationCap,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import { Badge } from "@/shared/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import SmartPagination from "@/shared/components/pagination/SmartPagination";
import { useProductCourseCatalog } from "../hooks/useProductCourses";
import { fetchUniversities } from "@/features/courses/api";
import ProductCourseCard from "../components/ProductCourseCard";
import type { University } from "@/features/courses/types";
import { useEffect, useCallback } from "react";

const ProductCourseCatalog = () => {
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [isFree, setIsFree] = useState<boolean | undefined>(undefined);
  const [universityId, setUniversityId] = useState<number | undefined>(
    undefined,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);

  const [universities, setUniversities] = useState<University[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchUniversities(1, 100)
      .then((res) => setUniversities(res.items))
      .catch(console.error);
  }, []);

  const {
    items: courses,
    totalCount,
    totalPages,
    loading,
    refetch: refetchCatalog,
  } = useProductCourseCatalog({
    pageNumber: currentPage,
    pageSize,
    search: appliedSearch,
    isFree,
    universityId,
  });

  // Re-fetch catalog so isEnrolled flags are refreshed
  const handleEnrollSuccess = useCallback(() => {
    refetchCatalog();
  }, [refetchCatalog]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(search);
    setCurrentPage(1);
  };

  const hasActiveFilters = isFree !== undefined || universityId !== undefined;

  const clearFilters = () => {
    setIsFree(undefined);
    setUniversityId(undefined);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero section */}
      <div className="relative bg-linear-to-br from-primary/5 via-background to-secondary/5 border-b">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative container mx-auto px-4 py-12 max-w-7xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Product Courses</h1>
              <p className="text-muted-foreground">
                Premium courses with video lessons, quizzes & certificates
              </p>
            </div>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="pl-10 h-11 bg-background"
              />
            </div>
            <Button type="submit" className="h-11 px-6 cursor-pointer">
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Filter bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="cursor-pointer gap-1.5"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="cursor-pointer gap-1 text-muted-foreground"
              >
                <X className="h-3.5 w-3.5" />
                Clear all
              </Button>
            )}

            {isFree && (
              <Badge variant="secondary" className="gap-1">
                Free only
                <button
                  onClick={() => {
                    setIsFree(undefined);
                    setCurrentPage(1);
                  }}
                  title="Remove free filter"
                  className="ml-1 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>

          {!loading && (
            <p className="text-sm text-muted-foreground">
              {totalCount} course{totalCount !== 1 ? "s" : ""} found
            </p>
          )}
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="flex flex-wrap gap-4 p-4 mb-6 rounded-xl border bg-muted/20">
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase text-muted-foreground tracking-wider">
                University
              </Label>
              <Select
                value={universityId?.toString() ?? "all"}
                onValueChange={(val) => {
                  setUniversityId(val === "all" ? undefined : parseInt(val));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="All universities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All universities</SelectItem>
                  {universities.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2 pb-2">
              <Checkbox
                id="freeOnly"
                checked={isFree === true}
                onCheckedChange={(checked) => {
                  setIsFree(checked === true ? true : undefined);
                  setCurrentPage(1);
                }}
              />
              <Label htmlFor="freeOnly" className="cursor-pointer text-sm">
                Free courses only
              </Label>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading courses...</p>
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
  );
};

export default ProductCourseCatalog;
