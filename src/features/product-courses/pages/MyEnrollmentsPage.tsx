import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import SmartPagination from "@/shared/components/pagination/SmartPagination";
import ProgressBar from "../components/ProgressBar";
import { useMyEnrollments } from "../hooks/useEnrollment";

const MyEnrollmentsPage = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const {
    items: enrollments,
    totalPages,
    loading,
  } = useMyEnrollments(currentPage, pageSize);

  const statusColors: Record<string, string> = {
    Active: "bg-green-500/10 text-green-700",
    Completed: "bg-secondary/10 text-secondary",
    Refunded: "bg-red-500/10 text-red-700",
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">My Learning</h1>
      <p className="text-muted-foreground mb-6">
        Your enrolled courses and progress.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : enrollments.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-lg font-medium">No enrollments yet</p>
          <p className="text-muted-foreground mt-1 mb-4">
            Browse our catalog to find courses.
          </p>
          <Button
            onClick={() => navigate("/browse/product-courses")}
            className="cursor-pointer"
          >
            Browse Courses
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {enrollments.map((enrollment) => (
            <Card
              key={enrollment.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {enrollment.courseTitle ??
                        `Course #${enrollment.productCourseId}`}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Enrolled on{" "}
                      {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={statusColors[enrollment.status] ?? ""}
                  >
                    {enrollment.status}
                  </Badge>
                </div>

                <ProgressBar
                  completedLessons={enrollment.completedLessons}
                  totalLessons={enrollment.totalLessons}
                  progressPercentage={enrollment.progressPercentage}
                />

                <div className="flex justify-end mt-3">
                  <Button
                    size="sm"
                    className="cursor-pointer"
                    onClick={() =>
                      navigate(
                        `/dashboard/product-courses/${enrollment.productCourseId}/lessons`,
                      )
                    }
                  >
                    Continue Learning
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {totalPages > 1 && (
            <SmartPagination
              pageNumber={currentPage}
              totalPages={totalPages}
              hasPreviousPage={currentPage > 1}
              hasNextPage={currentPage < totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default MyEnrollmentsPage;
