// ============================================================
// Hook for product course enrollment actions
// ============================================================

import { useState, useEffect, useCallback } from "react";
import {
  enrollInCourse,
  fetchMyEnrollments,
  fetchEnrolledCourses,
  completeLesson,
  getMyCertificates,
  getCertificateById,
} from "../api";
import type {
  ProductEnrollment,
  ProductCourseSummary,
  Certificate,
} from "../types";
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
        const enrollment = await enrollInCourse({
          productCourseId,
          prepaidCode,
        });
        return enrollment;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to enroll";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
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

// ── Enrolled Courses (for "My Courses" quick access) ───────

export const useEnrolledCourses = () => {
  const [courses, setCourses] = useState<ProductCourseSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchEnrolledCourses();
      setCourses(result);
    } catch (err) {
      console.error("Failed to fetch enrolled courses:", err);
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { courses, loading, error, refetch: fetch };
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
    [],
  );

  return { complete, loading };
};
// ── My Certificates ────────────────────────────────────────

export const useMyCertificates = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMyCertificates();
      setCertificates(result);
    } catch (err) {
      console.error("Failed to fetch certificates:", err);
      setError("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { certificates, loading, error, refetch: fetch };
};

// ── Certificate by ID ──────────────────────────────────────

export const useCertificate = (id: number | undefined) => {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getCertificateById(id);
      setCertificate(result);
    } catch (err) {
      console.error("Failed to fetch certificate:", err);
      setError("Certificate not found");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { certificate, loading, error, refetch: fetch };
};
