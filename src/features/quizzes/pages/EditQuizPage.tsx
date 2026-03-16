import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SEO from "@/shared/components/seo/SEO";
import { ArrowLeft, Plus, Save, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { fetchQuizById, updateQuiz } from "../api";
import { validateQuiz } from "../utils";
import { useQuizForm } from "../hooks/useQuizForm";
import { useImageUpload } from "../hooks/useImageUpload";
import { QuizDetailsForm } from "../components/QuizDetailsForm";
import { QuestionCard } from "../components/QuestionCard";
import { EmptyQuestionsState } from "../components/EmptyQuestionsState";
import { ErrorAlert } from "../components/ErrorAlert";
import { JsonQuizImporter } from "../components/JsonQuizImporter";
import type {
  QuizDetails,
  QuizQuestion,
  QuestionTypeString,
  QuestionTypeValue,
} from "../types";

// ─── helpers ────────────────────────────────────────────────────────────────

const typeStringToValue = (t: QuestionTypeString): QuestionTypeValue => {
  const map: Record<QuestionTypeString, QuestionTypeValue> = {
    SingleChoice: 1,
    MultipleChoice: 2,
    TrueFalse: 3,
    ShortAnswer: 4,
  };
  return map[t] ?? 1;
};

/** Convert API question shape → editable Question shape used by useQuizForm */
const toEditableQuestion = (q: QuizQuestion) => ({
  id: String(q.id),
  text: q.text,
  imageUrl: q.imageUrl,
  type: typeStringToValue(q.type),
  uploadingImage: false,
  choices: q.choices.map((c) => ({
    id: String(c.id),
    text: c.text,
    imageUrl: c.imageUrl,
    isCorrect: c.isCorrect,
    uploadingImage: false,
  })),
});

// ─── component ──────────────────────────────────────────────────────────────

const EditQuizPage = () => {
  const { courseId, quizId } = useParams<{
    courseId: string;
    quizId: string;
  }>();
  const navigate = useNavigate();

  // ── fetch state ─────────────────────────────────────────────────
  const [quiz, setQuiz] = useState<QuizDetails | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ── form — quiz details ─────────────────────────────────────────
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // ── form — questions (managed by hook) ─────────────────────────
  const {
    title,
    setTitle,
    description,
    setDescription,
    questions,
    setQuestions,
    error,
    setError,
    addQuestion,
    removeQuestion,
    updateQuestion,
    addChoice,
    removeChoice,
    updateChoice,
    handleQuestionTypeChange,
  } = useQuizForm();

  const {
    handleQuestionImageUpload,
    handleChoiceImageUpload,
    removeQuestionImage,
    removeChoiceImage,
  } = useImageUpload(setQuestions, setError);

  // ── submit state ────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── load existing quiz ──────────────────────────────────────────
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
        setQuestions(data.questions.map(toEditableQuestion));
      } catch (err) {
        setFetchError(
          err instanceof Error ? err.message : "Failed to load quiz",
        );
      } finally {
        setFetchLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  // ── tags helpers ────────────────────────────────────────────────
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

  // ── submit ──────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError(null);

    const validationError = validateQuiz(title, questions);
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!quiz) return;

    setIsSubmitting(true);
    try {
      await updateQuiz(quiz.id, {
        id: quiz.id,
        title: title.trim(),
        description: description.trim() || null,
        tags: tags.length > 0 ? tags : null,
        questions: questions.map((q) => ({
          text: q.text.trim(),
          imageUrl: q.imageUrl,
          type: q.type,
          choices: q.choices.map((c) => ({
            text: c.text.trim(),
            imageUrl: c.imageUrl,
            isCorrect: c.isCorrect,
          })),
        })),
      });
      navigate(-1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update quiz.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── render ──────────────────────────────────────────────────────
  return (
    <>
      <SEO title="تعديل الاختبار | eCampus" noIndex={true} hreflang={false} />
      <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              className="mb-4 gap-2"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Quizzes
            </Button>

            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Edit Quiz
            </h1>
            {quiz && (
              <p className="text-muted-foreground">
                Course #{courseId} · Quiz #{quiz.id}
              </p>
            )}
          </div>

          {/* ── Loading ─────────────────────────────────────────────── */}
          {fetchLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading quiz…</span>
            </div>
          )}

          {/* ── Fetch Error ──────────────────────────────────────────── */}
          {fetchError && !fetchLoading && (
            <ErrorAlert
              error={fetchError}
              onDismiss={() => setFetchError(null)}
            />
          )}

          {/* ── Form ─────────────────────────────────────────────────── */}
          {!fetchLoading && !fetchError && quiz && (
            <>
              {/* Validation / submit error */}
              {error && (
                <ErrorAlert error={error} onDismiss={() => setError(null)} />
              )}

              {/* JSON Import */}
              <JsonQuizImporter
                hasExistingQuestions={questions.length > 0}
                onImport={({
                  questions: imported,
                  title: t,
                  description: d,
                  tags: tgs,
                }) => {
                  setQuestions(imported);
                  if (t) setTitle(t);
                  if (d) setDescription(d);
                  if (tgs) setTags(tgs);
                }}
              />

              {/* Quiz details (title, description, tags) */}
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

              {/* Questions */}
              <div className="space-y-6 mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Questions</h2>
                  <p className="text-sm text-muted-foreground">
                    {questions.length} / 100 questions
                  </p>
                </div>

                {questions.length === 0 && (
                  <EmptyQuestionsState onAddQuestion={addQuestion} />
                )}

                {questions.map((question, qIndex) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    index={qIndex}
                    onRemove={() => removeQuestion(question.id)}
                    onUpdateQuestion={(field, value) =>
                      updateQuestion(question.id, field, value)
                    }
                    onTypeChange={(newType) =>
                      handleQuestionTypeChange(question.id, newType)
                    }
                    onAddChoice={() => addChoice(question.id)}
                    onRemoveChoice={(choiceId) =>
                      removeChoice(question.id, choiceId)
                    }
                    onUpdateChoice={(choiceId, field, value) =>
                      updateChoice(question.id, choiceId, field, value)
                    }
                    onQuestionImageUpload={(e) =>
                      handleQuestionImageUpload(question.id, e)
                    }
                    onChoiceImageUpload={(choiceId, e) =>
                      handleChoiceImageUpload(question.id, choiceId, e)
                    }
                    onRemoveQuestionImage={() =>
                      removeQuestionImage(question.id)
                    }
                    onRemoveChoiceImage={(choiceId) =>
                      removeChoiceImage(question.id, choiceId)
                    }
                  />
                ))}

                {/* Add question button */}
                {questions.length > 0 && (
                  <div className="flex justify-center pt-4">
                    <Button
                      onClick={addQuestion}
                      disabled={questions.length >= 100 || isSubmitting}
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another Question
                    </Button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t">
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
    </>
  );
};

export default EditQuizPage;
