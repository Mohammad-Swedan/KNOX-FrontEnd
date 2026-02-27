// ============================================================
// Hook for video upload flow (create → upload to Bunny → add lesson)
// ============================================================

import { useState, useCallback } from "react";
import { createVideo, uploadVideoToBunny, addLesson } from "../api";
import type { VideoUploadState, CreateVideoResult } from "../types";

interface UseVideoUploadOptions {
  productCourseId: number;
  topicId: number;
  onSuccess?: () => void;
}

export const useVideoUpload = ({ productCourseId, topicId, onSuccess }: UseVideoUploadOptions) => {
  const [state, setState] = useState<VideoUploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [videoResult, setVideoResult] = useState<CreateVideoResult | null>(null);

  const upload = useCallback(
    async (file: File, title: string, order: number, isFreePreview: boolean) => {
      setError(null);
      setProgress(0);

      try {
        // Step 1: Create video entry in backend
        setState("creating");
        const result = await createVideo({
          productCourseId,
          title,
        });
        setVideoResult(result);

        // Step 2: Upload file to Bunny.net
        setState("uploading");
        await uploadVideoToBunny(
          file,
          result.uploadUrl,
          result.libraryApiKey,
          (percent) => setProgress(Math.round(percent))
        );

        // Step 3: Create lesson record
        setState("saving");
        await addLesson(productCourseId, topicId, {
          title,
          order,
          type: 0, // Video
          isFreePreview,
          referenceId: result.videoId,
        });

        setState("complete");
        onSuccess?.();
      } catch (err) {
        console.error("Video upload failed:", err);
        setError(err instanceof Error ? err.message : "Upload failed");
        setState("error");
      }
    },
    [productCourseId, topicId, onSuccess]
  );

  const reset = useCallback(() => {
    setState("idle");
    setProgress(0);
    setError(null);
    setVideoResult(null);
  }, []);

  return {
    state,
    progress,
    error,
    videoResult,
    upload,
    reset,
  };
};
