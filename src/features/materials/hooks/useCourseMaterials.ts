import { useState, useEffect, useCallback } from "react";
import { getCourseMaterials, getManageContents } from "../api";
import type { CourseMaterialsResponse } from "../types";

interface UseCourseMaterialsProps {
  courseId: string | undefined;
  isManagementMode?: boolean;
}

export function useCourseMaterials(
  courseIdOrProps: string | undefined | UseCourseMaterialsProps,
) {
  // Support both old (string) and new (object) API
  const courseId =
    typeof courseIdOrProps === "string" || courseIdOrProps === undefined
      ? courseIdOrProps
      : courseIdOrProps.courseId;
  const isManagementMode =
    typeof courseIdOrProps === "object" && courseIdOrProps !== undefined
      ? courseIdOrProps.isManagementMode
      : false;

  const [loading, setLoading] = useState(true);
  const [contents, setContents] = useState<CourseMaterialsResponse | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    async function loadRootMaterials() {
      if (!courseId) return;

      setLoading(true);
      setError(null);

      try {
        // Manage mode uses /manage-contents so admins/writers see everything they can manage
        const data = isManagementMode
          ? await getManageContents(courseId)
          : await getCourseMaterials(courseId);
        setContents(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load materials",
        );
        console.error("Error loading materials:", err);
      } finally {
        setLoading(false);
      }
    }

    loadRootMaterials();
  }, [courseId, isManagementMode, refetchTrigger]);

  return { loading, contents, error, refetch };
}
