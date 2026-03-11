import { apiClient } from "@/lib/api/apiClient";
import type {
  FolderContentsResponse,
  CourseMaterialsResponse,
  FolderItem,
  MaterialItem,
} from "./types";

// ─── READ endpoints ────────────────────────────────────────────────────────

/** Public: GET /courses/{courseId}/contents?folderId= */
export async function getCourseContents(
  courseId: string,
  folderId?: string,
): Promise<FolderContentsResponse> {
  const url = `/courses/${courseId}/contents${folderId ? `?folderId=${folderId}` : ""}`;
  const response = await apiClient.get<FolderContentsResponse>(url);
  return response.data;
}

/** Auth: GET /courses/{courseId}/my-contents?folderId= */
export async function GetMyCourseContent(
  courseId: string,
  folderId?: string,
): Promise<FolderContentsResponse> {
  const url = `/courses/${courseId}/my-contents${folderId ? `?folderId=${folderId}` : ""}`;
  const response = await apiClient.get<FolderContentsResponse>(url);
  return response.data;
}

/** Auth (Writer/Admin/SuperAdmin): GET /courses/{courseId}/manage-contents?folderId= */
export async function getManageContents(
  courseId: string,
  folderId?: string,
): Promise<FolderContentsResponse> {
  const url = `/courses/${courseId}/manage-contents${folderId ? `?folderId=${folderId}` : ""}`;
  const response = await apiClient.get<FolderContentsResponse>(url);
  return response.data;
}

/** Convenience alias – root level contents (public) */
export async function getCourseMaterials(
  courseId: string,
): Promise<CourseMaterialsResponse> {
  const response = await apiClient.get<CourseMaterialsResponse>(
    `/courses/${courseId}/contents`,
  );
  return response.data;
}

// ─── FOLDER endpoints ──────────────────────────────────────────────────────

/** POST /courses/{courseId}/folders */
export async function createFolder(payload: {
  courseId: number;
  name: string;
  description?: string | null;
  parentFolderId?: number | null;
}): Promise<FolderItem> {
  const { courseId, ...body } = payload;
  const response = await apiClient.post<FolderItem>(
    `/courses/${courseId}/folders`,
    body,
  );
  return response.data;
}

/** PUT /courses/{courseId}/folders/{folderId} */
export async function updateFolder(
  courseId: number,
  folderId: number,
  payload: {
    name?: string;
    description?: string;
    parentFolderId?: number | null;
    moveToRoot?: boolean;
  },
): Promise<FolderItem> {
  const response = await apiClient.put<FolderItem>(
    `/courses/${courseId}/folders/${folderId}`,
    payload,
  );
  return response.data;
}

/** DELETE /courses/{courseId}/folders/{folderId} */
export async function deleteFolder(
  courseId: number,
  folderId: number,
): Promise<void> {
  await apiClient.delete(`/courses/${courseId}/folders/${folderId}`);
}

// ─── FILE UPLOAD endpoint ─────────────────────────────────────────────────

export interface TemporaryUploadResponse {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

/** POST /files/upload/temporary — multipart/form-data, max 10 MB */
export async function uploadTemporaryFile(
  file: File,
): Promise<TemporaryUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileCategory", "material");
  const response = await apiClient.post<TemporaryUploadResponse>(
    "/files/upload/temporary",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
}

// ─── MATERIAL endpoints ────────────────────────────────────────────────────

/** POST /courses/{courseId}/materials */
export async function createMaterial(
  courseId: number,
  payload: {
    title: string;
    contemtUrl: string;
    folderId?: number | null;
    description?: string;
    tags?: string[];
  },
): Promise<MaterialItem> {
  const response = await apiClient.post<MaterialItem>(
    `/courses/${courseId}/materials`,
    payload,
  );
  return response.data;
}

/** PUT /courses/{courseId}/materials/{materialId} */
export async function updateMaterial(
  courseId: number,
  materialId: number,
  payload: {
    title?: string;
    contentUrl?: string;
    folderId?: number | null;
    movedToRoot?: boolean;
    description?: string;
    tags?: string[];
  },
): Promise<MaterialItem> {
  const response = await apiClient.put<MaterialItem>(
    `/courses/${courseId}/materials/${materialId}`,
    payload,
  );
  return response.data;
}

/** DELETE /courses/{courseId}/materials/{materialId} */
export async function deleteMaterial(
  courseId: number,
  materialId: number,
): Promise<void> {
  await apiClient.delete(`/courses/${courseId}/materials/${materialId}`);
}
