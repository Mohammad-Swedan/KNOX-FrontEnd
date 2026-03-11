// ============================================================
// Hook for fetching lesson content (quiz / material)
// ============================================================

import { useState, useCallback } from "react";
import {
  fetchLessonQuiz,
  fetchLessonVideo,
  fetchLessonMaterial,
  fetchLessonExternalVideo,
} from "../api";
import { LessonType } from "../types";
import type {
  LessonQuizContent,
  LessonVideoContent,
  LessonMaterialContent,
  LessonExternalVideoContent,
} from "../types";

export type LessonContentData =
  | { kind: "quiz"; data: LessonQuizContent }
  | { kind: "video"; data: LessonVideoContent }
  | { kind: "material"; data: LessonMaterialContent }
  | { kind: "external"; data: LessonExternalVideoContent }
  | null;

/**
 * Fetches lesson content on demand based on lesson type.
 * - Quiz ("Quiz")       → GET /lessons/{id}/quiz
 * - Video ("Video")     → GET /lessons/{id}/video
 * - Document ("Document") → GET /lessons/{id}/material
 */
export const useLessonContent = () => {
  const [content, setContent] = useState<LessonContentData>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);

  const fetchContent = useCallback(
    async (lessonId: number, lessonType: string | number) => {
      setLoading(true);
      setError(null);
      setContent(null);
      setActiveLessonId(lessonId);

      try {
        if (lessonType === LessonType.Quiz) {
          const data = await fetchLessonQuiz(lessonId);
          setContent({ kind: "quiz", data });
        } else if (lessonType === LessonType.Video) {
          const data = await fetchLessonVideo(lessonId);
          setContent({ kind: "video", data });
        } else if (lessonType === LessonType.ExternalVideo) {
          const data = await fetchLessonExternalVideo(lessonId);
          setContent({ kind: "external", data });
        } else {
          // Document type
          const data = await fetchLessonMaterial(lessonId);
          setContent({ kind: "material", data });
        }
      } catch (err) {
        console.error("Failed to fetch lesson content:", err);
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
        if (status === 403) {
          setError(
            "You don't have access to this lesson. Please enroll in the course.",
          );
        } else {
          setError("Failed to load lesson content. Please try again.");
        }
        setContent(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const clear = useCallback(() => {
    setContent(null);
    setError(null);
    setLoading(false);
    setActiveLessonId(null);
  }, []);

  return { content, loading, error, activeLessonId, fetchContent, clear };
};
