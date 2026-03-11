// ============================================================
// Product Courses Feature — API Service
// ============================================================

import axios from "axios";
import { apiClient } from "@/lib/api/apiClient";
import { BASE_URL } from "@/lib/api/apiClient";
import { getPaginated } from "@/lib/api/pagination";
import type { PaginatedResponse } from "@/lib/api/types";
import type {
  ProductCourseSummary,
  ProductCourse,
  CreateProductCourseRequest,
  UpdateProductCourseRequest,
  Lesson,
  AddLessonRequest,
  TopicDto,
  AddTopicRequest,
  CourseOutlineDto,
  EnrolledCourseOutlineDto,
  CourseContentDto,
  CreateVideoRequest,
  CreateVideoResult,
  VideoToken,
  VideoInfo,
  EnrollRequest,
  ProductEnrollment,
  Certificate,
  CreatePrepaidCodeRequest,
  PrepaidCode,
  ProductCourseFilterParams,
  LessonQuizContent,
  LessonMaterialContent,
  LessonVideoContent,
  LessonExternalVideoContent,
  UpdateTopicRequest,
  UpdateLessonRequest,
  TogglePublishResponse,
  PermanentUploadResponse,
} from "./types";

// ── Product Courses CRUD ───────────────────────────────────

/** Get product courses by academic course */
export const fetchProductCoursesByAcademic = async (
  academicCourseId: number,
): Promise<ProductCourseSummary[]> => {
  const response = await apiClient.get<ProductCourseSummary[]>(
    `/product-courses/by-academic/${academicCourseId}`,
  );
  return response.data;
};

/** Get a single product course by ID */
export const fetchProductCourseById = async (
  id: number,
): Promise<ProductCourse> => {
  const response = await apiClient.get<ProductCourse>(`/product-courses/${id}`);
  return response.data;
};

/** Create a new product course */
export const createProductCourse = async (
  data: CreateProductCourseRequest,
): Promise<ProductCourse> => {
  const response = await apiClient.post<ProductCourse>(
    "/product-courses",
    data,
  );
  return response.data;
};

/** Update an existing product course */
export const updateProductCourse = async (
  id: number,
  data: UpdateProductCourseRequest,
): Promise<ProductCourse> => {
  const response = await apiClient.put<ProductCourse>(
    `/product-courses/${id}`,
    data,
  );
  return response.data;
};

/** Publish a product course (Draft → Published) */
export const publishProductCourse = async (
  id: number,
): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(
    `/product-courses/${id}/publish`,
  );
  return response.data;
};

/** Unpublish a product course → back to Draft */
export const unpublishProductCourse = async (
  id: number,
): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(
    `/product-courses/${id}/unpublish`,
  );
  return response.data;
};

/** Toggle publish/unpublish a product course */
export const togglePublishProductCourse = async (
  id: number,
): Promise<TogglePublishResponse> => {
  const response = await apiClient.post<TogglePublishResponse>(
    `/product-courses/${id}/toggle-publish`,
  );
  return response.data;
};

/** Soft-delete a product course */
export const deleteProductCourse = async (
  id: number,
): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(
    `/product-courses/${id}`,
  );
  return response.data;
};

/** Filter / browse product courses (public) */
export const filterProductCourses = async (
  params: ProductCourseFilterParams,
): Promise<PaginatedResponse<ProductCourseSummary>> => {
  const extra: string[] = [];
  if (params.search) extra.push(`search=${encodeURIComponent(params.search)}`);
  if (params.categoryId) extra.push(`categoryId=${params.categoryId}`);
  if (params.universityId) extra.push(`universityId=${params.universityId}`);
  if (params.facultyId) extra.push(`facultyId=${params.facultyId}`);
  if (params.majorId) extra.push(`majorId=${params.majorId}`);
  if (params.isFree !== undefined) extra.push(`isFree=${params.isFree}`);
  if (params.instructorId) extra.push(`instructorId=${params.instructorId}`);

  return getPaginated<ProductCourseSummary>(
    "/product-courses/filter",
    params.pageNumber ?? 1,
    params.pageSize ?? 10,
    extra.join("&"),
  );
};

// ── Topics ─────────────────────────────────────────────────

/** Add a topic to a product course */
export const addTopic = async (
  courseId: number,
  data: AddTopicRequest,
): Promise<TopicDto> => {
  const response = await apiClient.post<TopicDto>(
    `/product-courses/${courseId}/topics`,
    data,
  );
  return response.data;
};

/** Update a topic's title and/or order */
export const updateTopic = async (
  topicId: number,
  data: UpdateTopicRequest,
): Promise<TopicDto> => {
  const response = await apiClient.put<TopicDto>(
    `/product-courses/topics/${topicId}`,
    data,
  );
  return response.data;
};

/** Delete a topic (cascades to all lessons + external storage) */
export const deleteTopic = async (
  topicId: number,
): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(
    `/product-courses/topics/${topicId}`,
  );
  return response.data;
};

// ── Lessons ────────────────────────────────────────────────

/** Get lessons for a product course (flat legacy) */
export const fetchLessons = async (
  productCourseId: number,
): Promise<Lesson[]> => {
  const response = await apiClient.get<Lesson[]>(
    `/product-courses/${productCourseId}/lessons`,
  );
  return response.data;
};

/** Add a lesson to a topic within a course */
export const addLesson = async (
  courseId: number,
  topicId: number,
  data: AddLessonRequest,
): Promise<Lesson> => {
  const response = await apiClient.post<Lesson>(
    `/product-courses/${courseId}/topics/${topicId}/lessons`,
    data,
  );
  return response.data;
};

/** Update a lesson's title, order, free-preview flag, or content reference */
export const updateLesson = async (
  lessonId: number,
  data: UpdateLessonRequest,
): Promise<Lesson> => {
  const response = await apiClient.put<Lesson>(
    `/product-courses/lessons/${lessonId}`,
    data,
  );
  return response.data;
};

/** Delete a lesson + remove associated external content from storage */
export const deleteLesson = async (
  lessonId: number,
): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(
    `/product-courses/lessons/${lessonId}`,
  );
  return response.data;
};

// ── Outlines ───────────────────────────────────────────────

/** Get public course outline (no auth required) */
export const fetchCourseOutline = async (
  courseId: number,
): Promise<CourseOutlineDto> => {
  const response = await apiClient.get<CourseOutlineDto>(
    `/product-courses/${courseId}/outline`,
  );
  return response.data;
};

/** Get enrolled course outline with progress (auth required) */
export const fetchEnrolledOutline = async (
  courseId: number,
): Promise<EnrolledCourseOutlineDto> => {
  const response = await apiClient.get<EnrolledCourseOutlineDto>(
    `/product-courses/${courseId}/enrolled-outline`,
  );
  return response.data;
};

/** Get unified course content (topics + lessons, respects enrollment status) */
export const fetchCourseContent = async (
  courseId: number,
): Promise<CourseContentDto> => {
  const response = await apiClient.get<CourseContentDto>(
    `/product-courses/${courseId}/content`,
  );
  return response.data;
};

/** Get enrolled course content (topics + lessons with completion status) */
export const fetchEnrolledContent = async (
  courseId: number,
): Promise<CourseContentDto> => {
  const response = await apiClient.get<CourseContentDto>(
    `/product-courses/${courseId}/enrolled-content`,
  );
  return response.data;
};

// ── Videos ─────────────────────────────────────────────────

/** Create a video entry (returns upload URL) */
export const createVideo = async (
  data: CreateVideoRequest,
): Promise<CreateVideoResult> => {
  const response = await apiClient.post<CreateVideoResult>(
    "/product-courses/videos/create",
    data,
  );
  return response.data;
};

/** Upload video file directly to Bunny.net */
export const uploadVideoToBunny = (
  file: File,
  uploadUrl: string,
  libraryApiKey: string,
  onProgress: (percent: number) => void,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress((e.loaded / e.total) * 100);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("AccessKey", libraryApiKey);
    xhr.setRequestHeader("Content-Type", "application/octet-stream");
    xhr.send(file);
  });
};

/** Get video info / status by ID */
export const fetchVideoInfo = async (videoId: number): Promise<VideoInfo> => {
  const response = await apiClient.get<VideoInfo>(
    `/product-courses/videos/${videoId}`,
  );
  return response.data;
};

/** Get a signed playback token for a video (auth optional for free-preview) */
export const fetchVideoToken = async (
  videoId: number,
  skipAuth = false,
): Promise<VideoToken> => {
  if (skipAuth) {
    // Use a plain axios call without the auth interceptor
    const response = await axios.get<VideoToken>(
      `${BASE_URL}/product-courses/videos/token/${videoId}`,
    );
    return response.data;
  }
  const response = await apiClient.get<VideoToken>(
    `/product-courses/videos/token/${videoId}`,
  );
  return response.data;
};

// ── Enrollments ────────────────────────────────────────────

/** Enroll in a product course */
export const enrollInCourse = async (
  data: EnrollRequest,
): Promise<ProductEnrollment> => {
  const response = await apiClient.post<ProductEnrollment>(
    "/product-courses/enrollments",
    data,
  );
  return response.data;
};

/** Get current user's enrollments */
export const fetchMyEnrollments = async (
  pageNumber = 1,
  pageSize = 10,
): Promise<PaginatedResponse<ProductEnrollment>> => {
  return getPaginated<ProductEnrollment>(
    "/product-courses/enrollments/my",
    pageNumber,
    pageSize,
  );
};

/** Mark a lesson as completed */
export const completeLesson = async (
  enrollmentId: number,
  lessonId: number,
): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(
    `/product-courses/enrollments/${enrollmentId}/complete-lesson`,
    { lessonId },
  );
  return response.data;
};

// ── Certificates ───────────────────────────────────────────

/** Verify a certificate by certificate number */
export const verifyCertificate = async (
  certificateNumber: string,
): Promise<Certificate> => {
  const response = await apiClient.get<Certificate>(
    `/product-courses/certificates/verify/${certificateNumber}`,
  );
  return response.data;
};

// ── Prepaid Codes ──────────────────────────────────────────

/** Create a prepaid code */
export const createPrepaidCode = async (
  data: CreatePrepaidCodeRequest,
): Promise<PrepaidCode> => {
  const response = await apiClient.post<PrepaidCode>(
    "/product-courses/prepaid-codes",
    data,
  );
  return response.data;
};

// ── Lesson Content ─────────────────────────────────────────

/** Fetch quiz content for a quiz-type lesson */
export const fetchLessonQuiz = async (
  lessonId: number,
): Promise<LessonQuizContent> => {
  const response = await apiClient.get<LessonQuizContent>(
    `/product-courses/lessons/${lessonId}/quiz`,
  );
  return response.data;
};

/** Fetch video content for a video-type lesson */
export const fetchLessonVideo = async (
  lessonId: number,
): Promise<LessonVideoContent> => {
  const response = await apiClient.get<LessonVideoContent>(
    `/product-courses/lessons/${lessonId}/video`,
  );
  return response.data;
};

/** Fetch material/document content for a document-type lesson */
export const fetchLessonMaterial = async (
  lessonId: number,
): Promise<LessonMaterialContent> => {
  const response = await apiClient.get<LessonMaterialContent>(
    `/product-courses/lessons/${lessonId}/material`,
  );
  return response.data;
};

/** Fetch external-video content (directUrl) for an external-video-type lesson */
export const fetchLessonExternalVideo = async (
  lessonId: number,
): Promise<LessonExternalVideoContent> => {
  const response = await apiClient.get<LessonExternalVideoContent>(
    `/product-courses/lessons/${lessonId}/external-video`,
  );
  return response.data;
};

// ── File Upload ────────────────────────────────────────────

/** Upload a file to permanent storage (e.g. thumbnails, materials) */
export const uploadPermanentFile = async (
  file: File,
  fileCategory: string,
): Promise<PermanentUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileCategory", fileCategory);
  const response = await apiClient.post<PermanentUploadResponse>(
    "/files/upload/permanent",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
};
