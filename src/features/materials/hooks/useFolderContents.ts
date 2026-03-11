import { useState, useEffect, useCallback } from "react";
import {
  getCourseContents,
  getManageContents,
  deleteFolder,
  deleteMaterial,
} from "../api";
import type {
  FolderContentsResponse,
  FolderItem,
  MaterialItem,
} from "../types";

interface UseFolderContentsProps {
  courseId: string | undefined;
  folderId: string | undefined;
  isManagementMode?: boolean;
}

interface UseFolderContentsReturn {
  contents: FolderContentsResponse | null;
  loading: boolean;
  error: string | null;
  handleDeleteFolder: (folderId: number) => Promise<void>;
  handleDeleteMaterial: (materialId: number) => Promise<void>;
  handleEditFolder: (folder: FolderItem) => void;
  handleEditMaterial: (material: MaterialItem) => void;
  refetch: () => void;
}

export function useFolderContents({
  courseId,
  folderId,
  isManagementMode = false,
}: UseFolderContentsProps): UseFolderContentsReturn {
  const [loading, setLoading] = useState(true);
  const [contents, setContents] = useState<FolderContentsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    async function loadFolderContents() {
      if (!courseId) return;

      setLoading(true);
      setError(null);

      try {
        // Manage mode uses /manage-contents so writers/admins see everything they can manage
        const data = isManagementMode
          ? await getManageContents(courseId, folderId)
          : await getCourseContents(courseId, folderId);
        setContents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load folder");
        console.error("Error loading folder contents:", err);
      } finally {
        setLoading(false);
      }
    }

    loadFolderContents();
  }, [courseId, folderId, isManagementMode, refetchTrigger]);

  const handleDeleteFolder = async (folderIdToDelete: number) => {
    if (!courseId) return;
    try {
      await deleteFolder(parseInt(courseId), folderIdToDelete);
      refetch();
    } catch (err) {
      console.error("Error deleting folder:", err);
      throw err;
    }
  };

  const handleDeleteMaterial = async (materialId: number) => {
    if (!courseId) return;
    try {
      await deleteMaterial(parseInt(courseId), materialId);
      refetch();
    } catch (err) {
      console.error("Error deleting material:", err);
      throw err;
    }
  };

  // These are placeholders; the actual dialog opening is handled by the page
  const handleEditFolder = (_f: FolderItem) => void _f;
  const handleEditMaterial = (_m: MaterialItem) => void _m;

  return {
    contents,
    loading,
    error,
    handleDeleteFolder,
    handleDeleteMaterial,
    handleEditFolder,
    handleEditMaterial,
    refetch,
  };
}
