// ============================================================
// Hook for product course enrollment actions
// ============================================================

import { useState, useEffect, useCallback } from "react";
import {
  enrollInCourse,
  fetchMyEnrollments,
  completeLesson,
} from "../api";
import type { ProductEnrollment } from "../types";
import type { PaginatedResponse } from "@/lib/api/types";

// ── Enroll action ──────────────────────────────────────────

export const useEnroll = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enroll = useCallback(
    async (productCourseId: number, prepaidCode?: string) => {
      setLoading(true);
      setError(null);
      try {
        const enrollment = await enrollInCourse({ productCourseId, prepaidCode });
        return enrollment;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to enroll";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { enroll, loading, error };
};

// ── My Enrollments list ────────────────────────────────────

export const useMyEnrollments = (pageNumber = 1, pageSize = 10) => {
  const [data, setData] = useState<PaginatedResponse<ProductEnrollment>>({
    items: [],
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (pageNumber < 1 || pageSize < 1) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchMyEnrollments(pageNumber, pageSize);
      setData(result);
    } catch (err) {
      console.error("Failed to fetch enrollments:", err);
      setError("Failed to load enrollments");
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { ...data, loading, error, refetch: fetch };
};

// ── Complete lesson ────────────────────────────────────────

export const useCompleteLesson = () => {
  const [loading, setLoading] = useState(false);

  const complete = useCallback(
    async (enrollmentId: number, lessonId: number) => {
      setLoading(true);
      try {
        await completeLesson(enrollmentId, lessonId);
      } catch (err) {
        console.error("Failed to complete lesson:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { complete, loading };
};
