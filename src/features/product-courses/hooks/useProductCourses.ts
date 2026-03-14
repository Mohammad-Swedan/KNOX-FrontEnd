// ============================================================
// Hooks for Product Courses data fetching
// ============================================================

import { useState, useEffect, useCallback } from "react";
import {
  fetchProductCoursesByAcademic,
  fetchProductCoursesByAcademicPaginated,
  fetchMyProductCourses,
  fetchProductCourseById,
  filterProductCourses,
  fetchLessons,
  fetchCourseOutline,
  fetchEnrolledOutline,
  fetchCourseContent,
  fetchEnrolledContent,
} from "../api";
import type {
  ProductCourseSummary,
  ProductCourse,
  Lesson,
  ProductCourseFilterParams,
  CourseOutlineDto,
  EnrolledCourseOutlineDto,
  CourseContentDto,
} from "../types";
import type { PaginatedResponse } from "@/lib/api/types";

// ── Product Courses by Academic Course ─────────────────────

export const useProductCoursesByAcademic = (academicCourseId: number) => {
  const [courses, setCourses] = useState<ProductCourseSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!academicCourseId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProductCoursesByAcademic(academicCourseId);
      setCourses(data);
    } catch (err) {
      console.error("Failed to fetch product courses:", err);
      setError("Failed to load product courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [academicCourseId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { courses, loading, error, refetch: fetch };
};

// ── Product Courses by Academic Course (with pagination) ────

export const useProductCoursesByAcademicPaginated = (
  academicCourseId: number,
  pageNumber: number = 1,
  pageSize: number = 10,
) => {
  const [data, setData] = useState<PaginatedResponse<ProductCourseSummary>>({
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
    if (!academicCourseId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchProductCoursesByAcademicPaginated(
        academicCourseId,
        pageNumber,
        pageSize,
      );
      setData(result);
    } catch (err) {
      console.error("Failed to fetch product courses:", err);
      setError("Failed to load product courses");
    } finally {
      setLoading(false);
    }
  }, [academicCourseId, pageNumber, pageSize]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { ...data, loading, error, refetch: fetch };
};

// ── My Product Courses (instructor-scoped) ─────────────────

export const useMyProductCourses = () => {
  const [courses, setCourses] = useState<ProductCourseSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyProductCourses();
      setCourses(data);
    } catch (err) {
      console.error("Failed to fetch my product courses:", err);
      setError("Failed to load your product courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { courses, loading, error, refetch: fetch };
};

// ── Single Product Course ──────────────────────────────────

export const useProductCourse = (id: number | undefined) => {
  const [course, setCourse] = useState<ProductCourse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProductCourseById(id);
      setCourse(data);
    } catch (err) {
      console.error("Failed to fetch product course:", err);
      setError("Failed to load product course");
      setCourse(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { course, loading, error, refetch: fetch };
};

// ── Lessons ────────────────────────────────────────────────

export const useLessons = (productCourseId: number | undefined) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!productCourseId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLessons(productCourseId);
      setLessons(data.sort((a, b) => a.order - b.order));
    } catch (err) {
      console.error("Failed to fetch lessons:", err);
      setError("Failed to load lessons");
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, [productCourseId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { lessons, loading, error, refetch: fetch };
};

// ── Public Outline ─────────────────────────────────────────

export const useCourseOutline = (courseId: number | undefined) => {
  const [outline, setOutline] = useState<CourseOutlineDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCourseOutline(courseId);
      setOutline(data);
    } catch (err) {
      console.error("Failed to fetch course outline:", err);
      setError("Failed to load course outline");
      setOutline(null);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { outline, loading, error, refetch: fetch };
};

// ── Enrolled Outline ───────────────────────────────────────

export const useEnrolledOutline = (courseId: number | undefined) => {
  const [outline, setOutline] = useState<EnrolledCourseOutlineDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEnrolledOutline(courseId);
      setOutline(data);
    } catch (err) {
      console.error("Failed to fetch enrolled outline:", err);
      setError("Failed to load enrolled outline");
      setOutline(null);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { outline, loading, error, refetch: fetch };
};

// ── Filter / Browse Product Courses ────────────────────────

export const useProductCourseCatalog = (params: ProductCourseFilterParams) => {
  const [data, setData] = useState<PaginatedResponse<ProductCourseSummary>>({
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
    setLoading(true);
    setError(null);
    try {
      const result = await filterProductCourses(params);
      setData(result);
    } catch (err) {
      console.error("Failed to fetch catalog:", err);
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, [
    params.pageNumber,
    params.pageSize,
    params.search,
    params.categoryId,
    params.universityId,
    params.facultyId,
    params.majorId,
    params.isFree,
    params.instructorId,
  ]);

  // Trigger fetch whenever params change
  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { ...data, loading, error, refetch: fetch };
};

// ── Course Content (unified) ───────────────────────────────

export const useCourseContent = (
  courseId: number | undefined,
  isEnrolled?: boolean,
) => {
  const [content, setContent] = useState<CourseContentDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setError(null);
    try {
      const data = isEnrolled
        ? await fetchEnrolledContent(courseId)
        : await fetchCourseContent(courseId);
      setContent(data);
    } catch (err) {
      console.error("Failed to fetch course content:", err);
      setError("Failed to load course content");
      setContent(null);
    } finally {
      setLoading(false);
    }
  }, [courseId, isEnrolled]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { content, loading, error, refetch: fetch };
};
