import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import SEO from "@/shared/components/seo/SEO";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Label } from "@/shared/ui/label";
import { createQuiz, getUserIdFromToken } from "../api";
import { addLesson } from "@/features/product-courses/api";
import { validateQuiz } from "../utils";
import { useQuizForm } from "../hooks/useQuizForm";
import { useImageUpload } from "../hooks/useImageUpload";
import { QuizDetailsForm } from "../components/QuizDetailsForm";
import { EmptyQuestionsState } from "../components/EmptyQuestionsState";
import { QuestionCard } from "../components/QuestionCard";
import { ErrorAlert } from "../components/ErrorAlert";
import { QuizSubmitSection } from "../components/QuizSubmitSection";
import { JsonQuizImporter } from "../components/JsonQuizImporter";

const AddQuizPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Product course integration
  const productCourseIdParam = searchParams.get("productCourseId");
  const topicIdParam = searchParams.get("topicId");
  const lessonTitle = searchParams.get("lessonTitle");
  const lessonOrder = searchParams.get("lessonOrder");
  const lessonIsFree = searchParams.get("lessonIsFree") === "true";
  const returnTo = searchParams.get("returnTo");
  const [isFree, setIsFree] = useState(lessonIsFree);
  const productCourseId = productCourseIdParam
    ? parseInt(productCourseIdParam)
    : undefined;
  const topicId = topicIdParam ? parseInt(topicIdParam) : undefined;

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

  // Tags state
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

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

  const {
    handleQuestionImageUpload,
    handleChoiceImageUpload,
    removeQuestionImage,
    removeChoiceImage,
  } = useImageUpload(setQuestions, setError);

  const handleSubmit = async () => {
    setError(null);

    const validationError = validateQuiz(title, questions);
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    try {
      const writerId = getUserIdFromToken();

      const payload = {
        title: title.trim(),
        writerId,
        courseId: parseInt(courseId!),
        description: description.trim() || null,
        tags: tags.length > 0 ? tags : undefined,
        questions: questions.map((q) => ({
          text: q.text.trim(),
          quizId: 0,
          imageUrl: q.imageUrl,
          type: q.type,
          choices: q.choices.map((c) => ({
            text: c.text.trim(),
            imageUrl: c.imageUrl,
            isCorrect: c.isCorrect,
          })),
        })),
        ...(productCourseId ? { productCourseId, isFree } : {}),
      };

      const quizId = await createQuiz(payload);

      // If opened from product course manage-lessons, auto-link as a lesson
      if (productCourseId && topicId && lessonTitle) {
        await addLesson(productCourseId, topicId, {
          title: lessonTitle,
          order: lessonOrder ? parseInt(lessonOrder) : 1,
          type: 1, // Quiz
          isFreePreview: isFree,
          referenceId: quizId,
        });
        navigate(
          returnTo ?? `/dashboard/product-courses/${productCourseId}/lessons`,
        );
      } else {
        // Default: navigate back to quizzes page
        navigate(`/courses/${courseId}/quizzes`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create quiz");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO title="إضافة اختبار | eCampus" noIndex={true} hreflang={false} />
      <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              className="mb-4 gap-2"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Quizzes
            </Button>

            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Create New Quiz
            </h1>
            <p className="text-muted-foreground">
              Add questions and choices to create an engaging quiz for your
              course
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <ErrorAlert error={error} onDismiss={() => setError(null)} />
          )}

          {/* Quiz Details */}
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

          {/* Product Course Fields */}
          {productCourseId && (
            <div className="mb-6 p-4 rounded-xl border bg-primary/5 border-primary/20 dark:border-primary/20 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <p className="text-sm font-semibold text-primary dark:text-primary">
                  Product Course Quiz
                </p>
              </div>
              {lessonTitle && (
                <p className="text-xs text-muted-foreground">
                  Will be saved as lesson:{" "}
                  <span className="font-medium text-foreground">
                    "{lessonTitle}"
                  </span>
                </p>
              )}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isFreeQuiz"
                  checked={isFree}
                  onCheckedChange={(c) => setIsFree(c === true)}
                />
                <Label htmlFor="isFreeQuiz" className="cursor-pointer text-sm">
                  Free preview (accessible without enrollment)
                </Label>
              </div>
            </div>
          )}

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
                onRemoveQuestionImage={() => removeQuestionImage(question.id)}
                onRemoveChoiceImage={(choiceId) =>
                  removeChoiceImage(question.id, choiceId)
                }
              />
            ))}

            {/* Add Question Button */}
            {questions.length > 0 && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={addQuestion}
                  disabled={questions.length >= 100}
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

          {/* Submit Section */}
          <QuizSubmitSection
            questionsCount={questions.length}
            isSubmitting={isSubmitting}
            onCancel={() => navigate(-1)}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </>
  );
};

export default AddQuizPage;
