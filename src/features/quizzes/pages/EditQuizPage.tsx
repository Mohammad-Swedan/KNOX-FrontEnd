import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { fetchQuizById, updateQuiz } from "../api";
import { QuizDetailsForm } from "../components/QuizDetailsForm";
import { ErrorAlert } from "../components/ErrorAlert";
import type { QuizDetails } from "../types";

const EditQuizPage = () => {
  const { courseId, quizId } = useParams<{
    courseId: string;
    quizId: string;
  }>();
  const navigate = useNavigate();

  // Fetch state
  const [quiz, setQuiz] = useState<QuizDetails | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load existing quiz data
  useEffect(() => {
    const load = async () => {
      if (!quizId) return;
      setFetchLoading(true);
      setFetchError(null);
      try {
        const data = await fetchQuizById(quizId);
        setQuiz(data);
        setTitle(data.title);
        setDescription(data.description ?? "");
        setTags(data.tags ?? []);
      } catch (err) {
        setFetchError(
          err instanceof Error ? err.message : "Failed to load quiz",
        );
      } finally {
        setFetchLoading(false);
      }
    };
    load();
  }, [quizId]);

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setSubmitError("Title is required.");
      return;
    }
    if (!quiz) return;

    setSubmitError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      await updateQuiz(quiz.id, {
        id: quiz.id,
        title: title.trim(),
        description: description.trim() || null,
        tags: tags.length > 0 ? tags : null,
      });
      setSuccessMessage("Quiz updated successfully!");
      setTimeout(() => {
        navigate(-1);
      }, 1000);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to update quiz.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Quiz</h1>
            {quiz && (
              <p className="text-sm text-muted-foreground">
                Course #{courseId} · Quiz #{quiz.id}
              </p>
            )}
          </div>
        </div>

        {/* Loading */}
        {fetchLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading quiz…</span>
          </div>
        )}

        {/* Fetch Error */}
        {fetchError && !fetchLoading && (
          <ErrorAlert
            error={fetchError}
            onDismiss={() => setFetchError(null)}
          />
        )}

        {/* Form */}
        {!fetchLoading && !fetchError && quiz && (
          <>
            {submitError && (
              <ErrorAlert
                error={submitError}
                onDismiss={() => setSubmitError(null)}
              />
            )}

            {successMessage && (
              <div className="mb-4 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300">
                {successMessage}
              </div>
            )}

            <QuizDetailsForm
              title={title}
              description={description}
              tags={tags}
              tagInput={tagInput}
              onTitleChange={setTitle}
              onDescriptionChange={setDescription}
              onTagInputChange={setTagInput}
              onAddTag={addTag}
              onRemoveTag={removeTag}
            />

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EditQuizPage;
