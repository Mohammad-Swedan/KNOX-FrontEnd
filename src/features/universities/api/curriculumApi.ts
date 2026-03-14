// ============================================================
//  🌐  API Service — communicates with the backend
// ============================================================
import { apiClient } from "@/lib/api/apiClient";

export interface CurriculumData {
  CATEGORIES: Record<string, any>;
  TITLE: { main: string; sub: string };
  COURSES: any[];
  _meta?: any;
}

// ── MajorCurriculums endpoints ─────────────────────────────────

/**
 * GET /api/major-curriculums/{id}
 * Fetches a single curriculum by its own ID.
 */
export async function getCurriculumById(id: number | string) {
  const response = await apiClient.get(`/major-curriculums/${id}`);
  return response.data;
}

/**
 * POST /api/major-curriculums
 * Creates a new curriculum tree for a major.
 */
export async function createCurriculum(data: any) {
  const response = await apiClient.post(`/major-curriculums`, data);
  return response.data;
}

/**
 * PUT /api/major-curriculums/{id}
 * Fully updates an existing curriculum.
 */
export async function updateCurriculum(id: number | string, data: any) {
  const response = await apiClient.put(`/major-curriculums/${id}`, {
    ...data,
    id,
  });
  return response.data;
}

/**
 * DELETE /api/major-curriculums/{id}
 * Deletes a curriculum by ID.
 */
export async function deleteCurriculum(id: number | string) {
  const response = await apiClient.delete(`/major-curriculums/${id}`);
  return response.data;
}

// ── Majors endpoints ───────────────────────────────────────────

/**
 * GET /api/majors/{majorId}/curriculums
 * Returns all curriculum versions for a specific major,
 * ordered by VersionNumber descending (newest first).
 */
export async function getCurriculumsByMajor(majorId: number | string) {
  const response = await apiClient.get(`/majors/${majorId}/curriculums`);
  return response.data;
}

// ── Data transformation helpers ────────────────────────────────

/**
 * Converts the API DTO into the local data shape used by the app.
 *
 * API DTO → { CATEGORIES, TITLE, COURSES, _meta }
 *
 * categoriesJson and coursesJson are stringified JSON in the DTO,
 * so we parse them here.
 */
export function dtoToAppData(dto: any): CurriculumData {
  let categories = {};
  let courses = [];

  try {
    categories =
      typeof dto.categoriesJson === "string"
        ? JSON.parse(dto.categoriesJson)
        : dto.categoriesJson || {};
  } catch {
    console.error("Failed to parse categoriesJson", dto.categoriesJson);
  }

  try {
    courses =
      typeof dto.coursesJson === "string"
        ? JSON.parse(dto.coursesJson)
        : dto.coursesJson || [];
  } catch {
    console.error("Failed to parse coursesJson", dto.coursesJson);
  }

  return {
    CATEGORIES: categories,
    TITLE: {
      main: dto.title || "",
      sub: dto.subTitle || "",
    },
    COURSES: courses,
    _meta: {
      id: dto.id,
      majorId: dto.majorId,
      versionNumber: dto.versionNumber,
      isActive: dto.isActive,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    },
  };
}

/**
 * Converts the local app data back into the API DTO shape for
 * creating or updating a curriculum.
 *
 * { CATEGORIES, TITLE, COURSES, _meta } → API body
 */
export function appDataToDto(appData: CurriculumData) {
  const meta = appData._meta || {};
  return {
    ...(meta.id != null && { id: meta.id }),
    majorId: meta.majorId ?? 1,
    title: appData.TITLE?.main || "",
    subTitle: appData.TITLE?.sub || "",
    categoriesJson: JSON.stringify(appData.CATEGORIES || {}),
    coursesJson: JSON.stringify(appData.COURSES || []),
    versionNumber: meta.versionNumber ?? 1,
    isActive: meta.isActive ?? true,
  };
}
