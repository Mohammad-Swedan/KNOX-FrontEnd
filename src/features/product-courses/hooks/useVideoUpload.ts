// ============================================================
// Hook for video upload flow (create → upload to Bunny → add lesson)
// ============================================================

import { useState, useCallback } from "react";
import {
  createVideo,
  uploadVideoToBunny,
  addLesson,
  reuploadVideo,
} from "../api";
import type { VideoUploadState, CreateVideoResult } from "../types";

interface UseVideoUploadOptions {
  productCourseId: number;
  topicId: number;
  onSuccess?: () => void;
}

export const useVideoUpload = ({
  productCourseId,
  topicId,
  onSuccess,
}: UseVideoUploadOptions) => {
  const [state, setState] = useState<VideoUploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [videoResult, setVideoResult] = useState<CreateVideoResult | null>(
    null,
  );

  const upload = useCallback(
    async (
      file: File,
      title: string,
      order: number,
      isFreePreview: boolean,
    ) => {
      setError(null);
      setProgress(0);

      try {
        // Step 1: Create video entry in backend (get TUS credentials)
        setState("creating");
        const result = await createVideo({
          productCourseId,
          title,
        });
        setVideoResult(result);

        // Step 2: Upload file to Bunny.net using TUS protocol
        setState("uploading");
        await uploadVideoToBunny(file, result, (percent) =>
          setProgress(Math.round(percent)),
        );

        // Step 3: Create lesson record
        setState("saving");
        await addLesson(productCourseId, topicId, {
          title,
          order,
          type: 0, // Video
          isFreePreview,
          referenceId: result.id,
        });

        setState("complete");
        onSuccess?.();
      } catch (err) {
        console.error("Video upload failed:", err);
        setError(err instanceof Error ? err.message : "Upload failed");
        setState("error");
      }
    },
    [productCourseId, topicId, onSuccess],
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

// ============================================================
// Hook for re-uploading a video for an existing lesson
// (calls reupload endpoint → gets fresh Bunny credentials → uploads file)
// ============================================================

interface UseReuploadVideoOptions {
  onSuccess?: () => void;
}

export const useReuploadVideo = ({ onSuccess }: UseReuploadVideoOptions) => {
  const [state, setState] = useState<VideoUploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const reupload = useCallback(
    async (lessonId: number, file: File, title: string) => {
      setError(null);
      setProgress(0);

      try {
        // Step 1: Request fresh upload credentials from the backend
        setState("creating");
        const result = await reuploadVideo(lessonId, { title });

        // Step 2: Upload the new file to Bunny.net using TUS protocol
        setState("uploading");
        await uploadVideoToBunny(file, result, (percent) =>
          setProgress(Math.round(percent)),
        );

        setState("complete");
        onSuccess?.();
      } catch (err) {
        console.error("Video re-upload failed:", err);
        setError(err instanceof Error ? err.message : "Re-upload failed");
        setState("error");
      }
    },
    [onSuccess],
  );

  const reset = useCallback(() => {
    setState("idle");
    setProgress(0);
    setError(null);
  }, []);

  return {
    state,
    progress,
    error,
    reupload,
    reset,
  };
};
