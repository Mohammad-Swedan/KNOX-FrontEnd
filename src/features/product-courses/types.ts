// ============================================================
// Product Courses Feature — Type Definitions
// ============================================================

// ── Enums (as const to satisfy erasableSyntaxOnly) ─────────

export const ProductCourseStatus = {
  Draft: 0,
  InReview: 1,
  Published: 2,
  Archived: 3,
} as const;
export type ProductCourseStatus =
  (typeof ProductCourseStatus)[keyof typeof ProductCourseStatus];

export const ProductCourseStatusLabel: Record<number, string> = {
  [ProductCourseStatus.Draft]: "Draft",
  [ProductCourseStatus.InReview]: "InReview",
  [ProductCourseStatus.Published]: "Published",
  [ProductCourseStatus.Archived]: "Archived",
};

export const LessonType = {
  Video: "Video",
  Quiz: "Quiz",
  Document: "Document",
  ExternalVideo: "ExternalVideo",
} as const;
export type LessonType = (typeof LessonType)[keyof typeof LessonType];

export const LessonTypeLabel: Record<string, string> = {
  [LessonType.Video]: "Video",
  [LessonType.Quiz]: "Quiz",
  [LessonType.Document]: "Document",
  [LessonType.ExternalVideo]: "External Video",
};

export const VideoStatus = {
  Uploading: "Uploading",
  Queued: "Queued",
  Processing: "Processing",
  Encoding: "Encoding",
  Ready: "Ready",
  Failed: "Failed",
} as const;
export type VideoStatus = (typeof VideoStatus)[keyof typeof VideoStatus];

export interface VideoInfo {
  id: number;
  videoGuid: string;
  videoLibraryId: number;
  title: string;
  status: VideoStatus;
  duration: number | null;
  thumbnailUrl: string | null;
}

export const ProductEnrollmentStatus = {
  Active: 0,
  Completed: 1,
  Refunded: 2,
} as const;
export type ProductEnrollmentStatus =
  (typeof ProductEnrollmentStatus)[keyof typeof ProductEnrollmentStatus];

export const ProductEnrollmentStatusLabel: Record<number, string> = {
  [ProductEnrollmentStatus.Active]: "Active",
  [ProductEnrollmentStatus.Completed]: "Completed",
  [ProductEnrollmentStatus.Refunded]: "Refunded",
};

export const PrepaidCodeScopeType = {
  Course: 0,
  Faculty: 1,
  University: 2,
  Global: 3,
} as const;
export type PrepaidCodeScopeType =
  (typeof PrepaidCodeScopeType)[keyof typeof PrepaidCodeScopeType];

// ── Product Course ─────────────────────────────────────────

export interface ProductCourseSummary {
  id: number;
  title: string;
  slug: string;
  price: number;
  discountPercentage: number | null;
  discountedPrice: number | null;
  isFree: boolean;
  thumbnailUrl: string | null;
  trialVideoUrl: string | null;
  status: "Draft" | "InReview" | "Published" | "Archived";
  instructorName: string | null;
  instructorProfilePictureUrl: string | null;
  averageRating: number;
  totalEnrollments: number;
  lessonCount: number;
  isEnrolled?: boolean | null;
}

export interface ProductCourse {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  discountPercentage: number | null;
  discountedPrice: number | null;
  isFree: boolean;
  instructorId: number;
  instructorName: string | null;
  instructorProfilePictureUrl: string | null;
  academicCourseId: number | null;
  academicCourseName: string | null;
  universityId: number | null;
  facultyId: number | null;
  majorId: number | null;
  status: "Draft" | "InReview" | "Published" | "Archived";
  thumbnailUrl: string | null;
  trialVideoUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
  categories: string[];
  averageRating: number;
  totalEnrollments: number;
  lessonCount: number;
}

export interface CreateProductCourseRequest {
  title: string;
  price: number;
  isFree: boolean;
  discountPercentage?: number | null;
  description?: string;
  academicCourseId?: number;
  universityId?: number;
  facultyId?: number;
  majorId?: number;
  thumbnailUrl?: string;
  trialVideoUrl?: string;
  categoryIds?: number[];
}

export interface UpdateProductCourseRequest {
  title?: string;
  description?: string;
  price?: number;
  isFree?: boolean;
  discountPercentage?: number | null;
  thumbnailUrl?: string;
  trialVideoUrl?: string;
  academicCourseId?: number;
  universityId?: number;
  facultyId?: number;
  majorId?: number;
  categoryIds?: number[];
}

export interface UpdateDiscountRequest {
  /** 0–100, or null to remove the discount */
  discountPercentage: number | null;
}

// ── Topics ─────────────────────────────────────────────────

export interface TopicDto {
  id: number;
  productCourseId: number;
  title: string;
  order: number;
}

export interface AddTopicRequest {
  title: string;
  order: number;
}

// ── Lessons ────────────────────────────────────────────────

export interface Lesson {
  id: number;
  topicId: number;
  title: string;
  order: number;
  type: LessonType;
  isFreePreview: boolean;
  referenceId: number | null;
  isCompleted: boolean;
}

export interface AddLessonRequest {
  title: string;
  order: number;
  type: 0 | 1 | 2 | 3; // 0=Video, 1=Quiz, 2=Document, 3=ExternalVideo
  isFreePreview?: boolean;
  referenceId?: number;
  directUrl?: string;
}

export interface UpdateTopicRequest {
  title?: string;
  order?: number;
}

export interface UpdateLessonRequest {
  title?: string;
  order?: number;
  isFreePreview?: boolean;
  referenceId?: number;
  directUrl?: string;
}

export interface TogglePublishResponse {
  newStatus: "Published" | "Draft";
  message: string;
}

export interface PermanentUploadResponse {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

// ── Public Outline ─────────────────────────────────────────

export interface LessonOutlineDto {
  id: number;
  title: string;
  order: number;
  type: LessonType;
  isFreePreview: boolean;
  directUrl?: string | null;
}

export interface TopicOutlineDto {
  id: number;
  title: string;
  order: number;
  lessons: LessonOutlineDto[];
}

export interface CourseOutlineDto {
  courseId: number;
  courseTitle: string;
  trialVideoUrl: string | null;
  topics: TopicOutlineDto[];
}

// ── Enrolled Outline ───────────────────────────────────────

export interface LessonProgressDto {
  id: number;
  title: string;
  order: number;
  type: LessonType;
  isFreePreview: boolean;
  referenceId: number | null;
  isCompleted: boolean;
  directUrl?: string | null;
}

export interface TopicWithProgressDto {
  id: number;
  title: string;
  order: number;
  lessons: LessonProgressDto[];
}

export interface EnrolledCourseOutlineDto {
  courseId: number;
  courseTitle: string;
  trialVideoUrl: string | null;
  enrollmentId: number;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
  isCompleted: boolean;
  certificateId: number | null;
  topics: TopicWithProgressDto[];
}

// ── Videos ─────────────────────────────────────────────────

export interface CreateVideoRequest {
  productCourseId: number;
  title: string;
}

export interface CreateVideoResult {
  videoId: number;
  videoGuid: string;
  uploadUrl: string;
  libraryId: number;
  libraryApiKey: string;
}

export interface VideoToken {
  playbackUrl: string;
  expiresInSeconds: number;
}

export type VideoUploadState =
  | "idle"
  | "creating"
  | "uploading"
  | "saving"
  | "complete"
  | "error";

// ── Enrollment ─────────────────────────────────────────────

export interface EnrollRequest {
  productCourseId: number;
  prepaidCode?: string;
}

export interface ProductEnrollment {
  id: number;
  studentId: number;
  productCourseId: number;
  courseTitle: string | null;
  enrollmentDate: string;
  amountPaid: number;
  paymentMethod: string | null;
  status: "Active" | "Completed" | "Refunded";
  completionDate: string | null;
  certificateId: number | null;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
}

// ── Certificates ───────────────────────────────────────────

export interface Certificate {
  id: number;
  enrollmentId: number;
  certificateNumber: string;
  issuedAt: string;
  pdfUrl: string | null;
  isValid: boolean;
  courseName: string | null;
  studentName: string | null;
}

// ── Prepaid Codes ──────────────────────────────────────────

export interface CreatePrepaidCodeRequest {
  value: number;
  quantity: number;
  scopeType: 0 | 1 | 2 | 3;
  scopeReferenceId?: number;
  isReusable?: boolean;
  expirationDate?: string;
}

export interface PrepaidCode {
  id: number;
  code: string;
  value: number;
  quantity: number;
  remainingUses: number;
  isActive: boolean;
  expirationDate: string | null;
  scopeType: number;
  scopeReferenceId: number | null;
  isReusable: boolean;
}

// ── Course Content (unified view) ──────────────────────────

export interface CourseContentLessonDto {
  id: number;
  title: string;
  order: number;
  type: LessonType;
  isFreePreview: boolean;
  /** True when the student is not enrolled and the lesson is not a free preview. */
  isLocked: boolean;
  /** References a ProductVideoId, QuizId, or CourseMaterialId based on Type. Null when locked. */
  referenceId: number | null;
  /** Only meaningful when the student is enrolled. */
  isCompleted: boolean;
  /** Direct URL for ExternalVideo lessons. */
  directUrl?: string | null;
}

export interface CourseContentTopicDto {
  id: number;
  title: string;
  order: number;
  lessons: CourseContentLessonDto[];
}

export interface CourseContentDto {
  courseId: number;
  courseTitle: string;
  trialVideoUrl: string | null;
  isEnrolled: boolean;
  // Enrollment progress – only meaningful when isEnrolled is true
  enrollmentId: number | null;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
  isCompleted: boolean;
  certificateId: number | null;
  topics: CourseContentTopicDto[];
}

// ── Lesson Content (fetched per-lesson) ────────────────────

/** Quiz lesson content returned by GET /lessons/{lessonId}/quiz */
export interface LessonQuizChoice {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface LessonQuizQuestion {
  id: number;
  quizId: number;
  type: number;
  text: string;
  imageUrl: string | null;
  choices: LessonQuizChoice[];
}

export interface LessonQuizContent {
  id: number;
  courseId: number;
  writerId: number;
  writerName: string;
  title: string;
  description: string;
  likes: number;
  dislikes: number;
  createdAt: string;
  questions: LessonQuizQuestion[];
  tags?: string[];
}

/** Material/Document lesson content returned by GET /lessons/{lessonId}/material */
export interface LessonMaterialContent {
  id: number;
  title: string;
  contentUrl: string;
  description?: string | null;
  tags: string[];
}

/** Video lesson content returned by GET /lessons/{lessonId}/video */
export interface LessonVideoContent {
  playbackUrl: string;
  expiresInSeconds: number;
  videoStatus: VideoStatus;
}

/** External video lesson content returned by GET /lessons/{lessonId}/external-video */
export interface LessonExternalVideoContent {
  directUrl: string | null;
}

/** Video status labels for user-facing messages */
export const VideoStatusMessage: Record<string, string> = {
  [VideoStatus.Uploading]: "Video is being uploaded",
  [VideoStatus.Queued]: "Processing will start soon",
  [VideoStatus.Processing]: "Video is being processed",
  [VideoStatus.Encoding]: "Almost ready...",
  [VideoStatus.Ready]: "Ready",
  [VideoStatus.Failed]: "Video unavailable",
};

// ── Filter params ──────────────────────────────────────────

export interface ProductCourseFilterParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  categoryId?: number;
  universityId?: number;
  facultyId?: number;
  majorId?: number;
  isFree?: boolean;
  instructorId?: number;
}

// ── Enrollment Error Codes ─────────────────────────────────

export const ENROLLMENT_ERROR_MESSAGES: Record<string, string> = {
  "PrepaidCode.NotFound": "This code does not exist.",
  "PrepaidCode.InsufficientValue":
    "This code's value does not cover the course price.",
  "PrepaidCode.ScopeInvalid": "This code is not valid for this course.",
  "PrepaidCode.Inactive": "This code is no longer active.",
  "PrepaidCode.Expired": "This code has expired.",
  "PrepaidCode.NoUses": "This code has no remaining uses.",
  "ProductEnrollment.AlreadyExists": "You are already enrolled in this course.",
};
