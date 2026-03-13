import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Video,
  HelpCircle,
  FileText,
  Loader2,
  BookOpen,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  GripVertical,
  Pencil,
  Trash2,
  Globe,
  EyeOff,
  ExternalLink,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useCourseContent, useProductCourse } from "../hooks/useProductCourses";
import { useLessonContent } from "../hooks/useLessonContent";
import { useUserRole } from "@/hooks/useUserRole";
import {
  addTopic,
  addLesson,
  updateTopic,
  deleteTopic,
  updateLesson,
  deleteLesson,
  togglePublishProductCourse,
  deleteProductCourse,
} from "../api";
import QuizLessonViewer from "../components/QuizLessonViewer";
import VideoLessonViewer from "../components/VideoLessonViewer";
import MaterialLessonViewer from "../components/MaterialLessonViewer";
import ExternalVideoViewer from "../components/ExternalVideoViewer";
import ReuploadVideoModal from "../components/ReuploadVideoModal";
import type { CourseContentTopicDto, CourseContentLessonDto } from "../types";

const LessonTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "Video":
      return <Video className="h-3.5 w-3.5 text-primary" />;
    case "Quiz":
      return <HelpCircle className="h-3.5 w-3.5 text-secondary" />;
    case "Document":
      return <FileText className="h-3.5 w-3.5 text-amber-600" />;
    case "ExternalVideo":
      return <ExternalLink className="h-3.5 w-3.5 text-rose-600" />;
    default:
      return <FileText className="h-3.5 w-3.5 text-muted-foreground" />;
  }
};

const LessonTypeBg = ({ type }: { type: string }) => {
  switch (type) {
    case "Video":
      return "bg-primary/10";
    case "Quiz":
      return "bg-secondary/10";
    case "Document":
      return "bg-amber-500/10";
    case "ExternalVideo":
      return "bg-rose-500/10";
    default:
      return "bg-muted";
  }
};

const ManageLessonsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useUserRole();
  const courseId = parseInt(id || "0");
  const canManage = hasRole(["SuperAdmin", "Admin", "Instructor"]);

  const { course, refetch: refetchCourse } = useProductCourse(courseId);
  const { content: outline, loading, refetch } = useCourseContent(courseId);

  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());
  const [addTopicOpen, setAddTopicOpen] = useState(false);
  const [topicTitle, setTopicTitle] = useState("");
  const [addingTopic, setAddingTopic] = useState(false);

  const [isTogglingPublish, setIsTogglingPublish] = useState(false);
  const [showDeleteCourseDialog, setShowDeleteCourseDialog] = useState(false);
  const [isDeletingCourse, setIsDeletingCourse] = useState(false);

  const [previewLesson, setPreviewLesson] =
    useState<CourseContentLessonDto | null>(null);
  const {
    content: lessonContent,
    loading: contentLoading,
    error: contentError,
    fetchContent,
    clear: clearContent,
  } = useLessonContent();

  /** Maps the numeric type the API returns to the string LessonType the hook expects */

  const handleTogglePublish = async () => {
    setIsTogglingPublish(true);
    try {
      const res = await togglePublishProductCourse(courseId);
      toast.success(res.message);
      refetchCourse();
    } catch {
      toast.error("Failed to update course status");
    } finally {
      setIsTogglingPublish(false);
    }
  };

  const handleDeleteCourse = async () => {
    setIsDeletingCourse(true);
    try {
      await deleteProductCourse(courseId);
      toast.success("Course deleted");
      navigate(-1);
    } catch {
      toast.error("Failed to delete course");
    } finally {
      setIsDeletingCourse(false);
      setShowDeleteCourseDialog(false);
    }
  };

  const toggleTopic = (topicId: number) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  };

  const handleAddTopic = async () => {
    if (!topicTitle.trim()) return;
    setAddingTopic(true);
    try {
      const nextOrder = outline
        ? Math.max(0, ...outline.topics.map((t) => t.order)) + 1
        : 1;
      await addTopic(courseId, { title: topicTitle.trim(), order: nextOrder });
      toast.success("Topic added!");
      setTopicTitle("");
      setAddTopicOpen(false);
      refetch();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add topic");
    } finally {
      setAddingTopic(false);
    }
  };

  const handleLessonClick = (lesson: CourseContentLessonDto) => {
    // ExternalVideo — embed in the preview dialog (no API fetch needed)
    if (lesson.type === "ExternalVideo") {
      if (!lesson.directUrl) {
        toast.info("No URL set for this external video lesson.");
        return;
      }
      setPreviewLesson(lesson);
      return;
    }
    // Video / Quiz / Document — fetch and show content dialog
    setPreviewLesson(lesson);
    fetchContent(lesson.id, lesson.type as string);
  };

  const totalLessons = outline
    ? outline.topics.reduce((sum, t) => sum + t.lessons.length, 0)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Page header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">
                Manage Curriculum
              </h1>
              {course && (
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                  {course.title}
                </p>
              )}
            </div>
          </div>

          {canManage && (
            <Button
              className="cursor-pointer gap-2 shrink-0"
              onClick={() => setAddTopicOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Topic
            </Button>
          )}
        </div>

        {/* Status & actions bar */}
        {canManage && course && (
          <div className="flex items-center gap-2 mb-8 flex-wrap">
            {/* Status badge */}
            <span
              className={[
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border",
                course.status === "Published"
                  ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                  : course.status === "Draft"
                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                    : course.status === "InReview"
                      ? "bg-primary/10 text-primary dark:text-primary border-primary/20"
                      : "bg-muted text-muted-foreground border-border",
              ].join(" ")}
            >
              {course.status === "Published" ? (
                <Globe className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3" />
              )}
              {course.status}
            </span>

            {/* Toggle publish — not available for Archived */}
            {course.status !== "Archived" && (
              <Button
                size="sm"
                variant="outline"
                className="cursor-pointer gap-1.5 h-8 text-xs"
                onClick={handleTogglePublish}
                disabled={isTogglingPublish}
              >
                {isTogglingPublish ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : course.status === "Published" ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Globe className="h-3.5 w-3.5" />
                )}
                {course.status === "Published" ? "Unpublish" : "Publish"}
              </Button>
            )}

            {/* Delete course */}
            <Button
              size="sm"
              variant="ghost"
              className="cursor-pointer gap-1.5 h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
              onClick={() => setShowDeleteCourseDialog(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Course
            </Button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading curriculum…</p>
          </div>
        ) : !outline || outline.topics.length === 0 ? (
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <FolderOpen className="h-7 w-7 text-muted-foreground/40" />
              </div>
              <div>
                <p className="text-base font-medium">No topics yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start by adding a topic to organize your lessons.
                </p>
              </div>
              {canManage && (
                <Button
                  className="cursor-pointer gap-2 mt-2"
                  onClick={() => setAddTopicOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add First Topic
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Stats bar */}
            <div className="flex items-center gap-4 mb-2 text-sm text-muted-foreground">
              <span>
                {outline.topics.length} topic
                {outline.topics.length !== 1 ? "s" : ""}
              </span>
              <span className="h-3 w-px bg-border" />
              <span>
                {totalLessons} lesson{totalLessons !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Topics */}
            {outline.topics
              .sort((a, b) => a.order - b.order)
              .map((topic) => (
                <TopicSection
                  key={topic.id}
                  topic={topic}
                  expanded={expandedTopics.has(topic.id)}
                  onToggle={() => toggleTopic(topic.id)}
                  onLessonClick={handleLessonClick}
                  canManage={canManage}
                  dashboardId={id!}
                  onRefetch={refetch}
                />
              ))}
          </div>
        )}
      </div>

      {/* Add Topic Dialog */}
      <Dialog open={addTopicOpen} onOpenChange={setAddTopicOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Topic</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="topicTitle" className="text-sm font-medium">
                Topic Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="topicTitle"
                value={topicTitle}
                onChange={(e) => setTopicTitle(e.target.value)}
                placeholder="e.g. Introduction to the Course"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddTopic();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddTopicOpen(false)}
              disabled={addingTopic}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddTopic}
              disabled={!topicTitle.trim() || addingTopic}
              className="cursor-pointer"
            >
              {addingTopic ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Topic
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Course Alert */}
      <AlertDialog
        open={showDeleteCourseDialog}
        onOpenChange={setShowDeleteCourseDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{course?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              The course will be soft-deleted. It won't appear publicly but all
              data is preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingCourse}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCourse}
              disabled={isDeletingCourse}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingCourse && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Delete Course
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Lesson Content Preview Dialog ─────────────────── */}
      <Dialog
        open={previewLesson !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewLesson(null);
            clearContent();
          }
        }}
      >
        <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
          {/* Header */}
          <DialogHeader className="px-5 pt-5 pb-3 border-b shrink-0">
            <DialogTitle className="flex items-center gap-2.5 text-base">
              {previewLesson && (
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${LessonTypeBg({ type: previewLesson.type as string })}`}
                >
                  <LessonTypeIcon type={previewLesson.type as string} />
                </div>
              )}
              <span className="truncate">{previewLesson?.title}</span>
              <span className="ml-auto text-xs font-normal text-muted-foreground shrink-0">
                {previewLesson?.type === "Video"
                  ? "Video"
                  : previewLesson?.type === "Quiz"
                    ? "Quiz"
                    : previewLesson?.type === "ExternalVideo"
                      ? "External Video"
                      : "Document"}
              </span>
            </DialogTitle>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* Loading */}
            {contentLoading && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Loading lesson content…
                </p>
              </div>
            )}

            {/* Error */}
            {contentError && !contentLoading && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <AlertCircle className="h-10 w-10 text-red-400" />
                <div className="text-center space-y-1">
                  <p className="font-medium">Could not load content</p>
                  <p className="text-sm text-muted-foreground">
                    {contentError}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer gap-1.5"
                  onClick={() =>
                    previewLesson &&
                    fetchContent(previewLesson.id, previewLesson.type as string)
                  }
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Try Again
                </Button>
              </div>
            )}

            {/* Quiz */}
            {!contentLoading &&
              !contentError &&
              lessonContent?.kind === "quiz" && (
                <QuizLessonViewer quiz={lessonContent.data} />
              )}

            {/* Video */}
            {!contentLoading &&
              !contentError &&
              lessonContent?.kind === "video" && (
                <VideoLessonViewer
                  video={lessonContent.data}
                  onRefresh={() =>
                    previewLesson &&
                    fetchContent(previewLesson.id, previewLesson.type as string)
                  }
                />
              )}

            {/* Document */}
            {!contentLoading &&
              !contentError &&
              lessonContent?.kind === "material" && (
                <MaterialLessonViewer material={lessonContent.data} />
              )}

            {/* External Video */}
            {!contentLoading &&
              previewLesson?.type === "ExternalVideo" &&
              (previewLesson.directUrl ? (
                <ExternalVideoViewer directUrl={previewLesson.directUrl} />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
                  <p className="text-sm text-muted-foreground">
                    No URL set for this external video lesson.
                  </p>
                </div>
              ))}

            {/* No content linked yet (non-ExternalVideo) */}
            {!contentLoading &&
              !contentError &&
              !lessonContent &&
              previewLesson?.type !== "ExternalVideo" && (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
                  <p className="text-sm text-muted-foreground">
                    No content linked to this lesson yet.
                  </p>
                </div>
              )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ── Topic Section ──────────────────────────────────────────

function TopicSection({
  topic,
  expanded,
  onToggle,
  onLessonClick,
  canManage,
  dashboardId,
  onRefetch,
}: {
  topic: CourseContentTopicDto;
  expanded: boolean;
  onToggle: () => void;
  onLessonClick: (lesson: CourseContentLessonDto) => void;
  canManage: boolean;
  dashboardId: string;
  onRefetch: () => void;
}) {
  const navigate = useNavigate();

  // ── Topic edit / delete ──────────────────────────────────
  const [editTopicOpen, setEditTopicOpen] = useState(false);
  const [editTopicTitle, setEditTopicTitle] = useState(topic.title);
  const [savingTopic, setSavingTopic] = useState(false);
  const [deleteTopicOpen, setDeleteTopicOpen] = useState(false);
  const [deletingTopic, setDeletingTopic] = useState(false);

  // ── Lesson edit / delete ─────────────────────────────────
  const [lessonToEdit, setLessonToEdit] =
    useState<CourseContentLessonDto | null>(null);
  const [editLessonTitle, setEditLessonTitle] = useState("");
  const [editLessonPreview, setEditLessonPreview] = useState(false);
  const [editLessonDirectUrl, setEditLessonDirectUrl] = useState("");
  const [savingLesson, setSavingLesson] = useState(false);
  const [lessonToDelete, setLessonToDelete] =
    useState<CourseContentLessonDto | null>(null);
  const [deletingLesson, setDeletingLesson] = useState(false);

  // ── Re-upload video lesson ───────────────────────────────
  const [reuploadLesson, setReuploadLesson] =
    useState<CourseContentLessonDto | null>(null);

  // ── Add external video lesson ────────────────────────────
  const [addExternalVideoOpen, setAddExternalVideoOpen] = useState(false);
  const [externalVideoTitle, setExternalVideoTitle] = useState("");
  const [externalVideoUrl, setExternalVideoUrl] = useState("");
  const [externalVideoPreview, setExternalVideoPreview] = useState(false);
  const [addingExternalVideo, setAddingExternalVideo] = useState(false);

  const openEditLesson = (lesson: CourseContentLessonDto) => {
    setLessonToEdit(lesson);
    setEditLessonTitle(lesson.title);
    setEditLessonPreview(lesson.isFreePreview);
    setEditLessonDirectUrl(lesson.directUrl ?? "");
  };

  const handleSaveTopic = async () => {
    if (!editTopicTitle.trim()) return;
    setSavingTopic(true);
    try {
      await updateTopic(topic.id, { title: editTopicTitle.trim() });
      toast.success("Topic updated");
      setEditTopicOpen(false);
      onRefetch();
    } catch {
      toast.error("Failed to update topic");
    } finally {
      setSavingTopic(false);
    }
  };

  const handleDeleteTopic = async () => {
    setDeletingTopic(true);
    try {
      await deleteTopic(topic.id);
      toast.success("Topic deleted");
      setDeleteTopicOpen(false);
      onRefetch();
    } catch {
      toast.error("Failed to delete topic");
    } finally {
      setDeletingTopic(false);
    }
  };

  const handleSaveLesson = async () => {
    if (!lessonToEdit || !editLessonTitle.trim()) return;
    setSavingLesson(true);
    try {
      const isExternal = lessonToEdit.type === "ExternalVideo";
      await updateLesson(lessonToEdit.id, {
        title: editLessonTitle.trim(),
        isFreePreview: editLessonPreview,
        ...(isExternal && editLessonDirectUrl.trim()
          ? { directUrl: editLessonDirectUrl.trim() }
          : {}),
      });
      toast.success("Lesson updated");
      setLessonToEdit(null);
      onRefetch();
    } catch {
      toast.error("Failed to update lesson");
    } finally {
      setSavingLesson(false);
    }
  };

  const handleAddExternalVideo = async () => {
    if (!externalVideoTitle.trim() || !externalVideoUrl.trim()) return;
    setAddingExternalVideo(true);
    try {
      const nextOrder =
        topic.lessons.length > 0
          ? Math.max(...topic.lessons.map((l) => l.order)) + 1
          : 1;
      await addLesson(parseInt(dashboardId), topic.id, {
        title: externalVideoTitle.trim(),
        order: nextOrder,
        type: 3,
        isFreePreview: externalVideoPreview,
        directUrl: externalVideoUrl.trim(),
      });
      toast.success("External video lesson added!");
      setExternalVideoTitle("");
      setExternalVideoUrl("");
      setExternalVideoPreview(false);
      setAddExternalVideoOpen(false);
      onRefetch();
    } catch {
      toast.error("Failed to add external video lesson");
    } finally {
      setAddingExternalVideo(false);
    }
  };

  const handleDeleteLesson = async () => {
    if (!lessonToDelete) return;
    setDeletingLesson(true);
    try {
      await deleteLesson(lessonToDelete.id);
      toast.success("Lesson deleted");
      setLessonToDelete(null);
      onRefetch();
    } catch {
      toast.error("Failed to delete lesson");
    } finally {
      setDeletingLesson(false);
    }
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Topic header */}
      <div className="flex items-center gap-3 px-5 py-4 hover:bg-muted/30 transition-colors">
        <button
          onClick={onToggle}
          className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer"
        >
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-primary" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold leading-tight truncate">
              {topic.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {topic.lessons.length} lesson
              {topic.lessons.length !== 1 ? "s" : ""}
            </p>
          </div>
        </button>

        {canManage && (
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => {
                setEditTopicTitle(topic.title);
                setEditTopicOpen(true);
              }}
              title="Edit topic"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-destructive"
              onClick={() => setDeleteTopicOpen(true)}
              title="Delete topic"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer gap-1.5 h-8 text-xs ml-1"
                >
                  <Plus className="h-3 w-3" />
                  Add Lesson
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Choose lesson type
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2.5 cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/dashboard/product-courses/${dashboardId}/topics/${topic.id}/lessons/add-video`,
                    )
                  }
                >
                  <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <Video className="h-3.5 w-3.5 text-primary" />
                  </div>
                  Video Lesson
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2.5 cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/dashboard/product-courses/${dashboardId}/topics/${topic.id}/lessons/add-quiz`,
                    )
                  }
                >
                  <div className="w-6 h-6 rounded-md bg-secondary/10 flex items-center justify-center shrink-0">
                    <HelpCircle className="h-3.5 w-3.5 text-secondary" />
                  </div>
                  Quiz Lesson
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2.5 cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/dashboard/product-courses/${dashboardId}/topics/${topic.id}/lessons/add-material`,
                    )
                  }
                >
                  <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center shrink-0">
                    <FileText className="h-3.5 w-3.5 text-amber-600" />
                  </div>
                  Material Lesson
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2.5 cursor-pointer"
                  onClick={() => {
                    setExternalVideoTitle("");
                    setExternalVideoUrl("");
                    setExternalVideoPreview(false);
                    setAddExternalVideoOpen(true);
                  }}
                >
                  <div className="w-6 h-6 rounded-md bg-rose-500/10 flex items-center justify-center shrink-0">
                    <ExternalLink className="h-3.5 w-3.5 text-rose-600" />
                  </div>
                  External Video
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Lessons list */}
      {expanded && (
        <div className="border-t">
          {topic.lessons.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">
              No lessons in this topic yet.
            </p>
          ) : (
            <div className="divide-y">
              {topic.lessons
                .sort((a, b) => a.order - b.order)
                .map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors group"
                  >
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
                    <button
                      onClick={() => onLessonClick(lesson)}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer"
                    >
                      <div
                        className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${LessonTypeBg({ type: lesson.type })}`}
                      >
                        <LessonTypeIcon type={lesson.type} />
                      </div>
                      <span className="text-sm flex-1 truncate">
                        {lesson.title}
                      </span>
                      {lesson.isFreePreview && (
                        <span className="text-[10px] font-medium bg-green-500/10 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full">
                          Preview
                        </span>
                      )}
                    </button>
                    {canManage && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {lesson.type === "Video" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-primary"
                            onClick={() => setReuploadLesson(lesson)}
                            title="Re-upload video"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-foreground"
                          onClick={() => openEditLesson(lesson)}
                          title="Edit lesson"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-destructive"
                          onClick={() => setLessonToDelete(lesson)}
                          title="Delete lesson"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ── Edit Topic Dialog ─────────────────────────────── */}
      <Dialog open={editTopicOpen} onOpenChange={setEditTopicOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Topic</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="editTopicTitle" className="text-sm font-medium">
                Topic Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="editTopicTitle"
                value={editTopicTitle}
                onChange={(e) => setEditTopicTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTopic();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditTopicOpen(false)}
              disabled={savingTopic}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTopic}
              disabled={!editTopicTitle.trim() || savingTopic}
              className="cursor-pointer"
            >
              {savingTopic && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Topic Alert ────────────────────────────── */}
      <AlertDialog open={deleteTopicOpen} onOpenChange={setDeleteTopicOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{topic.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              All lessons inside this topic and their external content (videos,
              documents) will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingTopic}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTopic}
              disabled={deletingTopic}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingTopic && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Edit Lesson Dialog ────────────────────────────── */}
      <Dialog
        open={lessonToEdit !== null}
        onOpenChange={(open: boolean) => {
          if (!open) setLessonToEdit(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="editLessonTitle" className="text-sm font-medium">
                Lesson Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="editLessonTitle"
                value={editLessonTitle}
                onChange={(e) => setEditLessonTitle(e.target.value)}
                disabled={savingLesson}
              />
            </div>
            {lessonToEdit?.type === "ExternalVideo" && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="editLessonDirectUrl"
                  className="text-sm font-medium"
                >
                  Video URL
                </Label>
                <Input
                  id="editLessonDirectUrl"
                  value={editLessonDirectUrl}
                  onChange={(e) => setEditLessonDirectUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  disabled={savingLesson}
                />
              </div>
            )}
            <div className="flex items-center gap-2.5 rounded-xl border bg-muted/30 px-4 py-3">
              <Checkbox
                id="editLessonPreview"
                checked={editLessonPreview}
                onCheckedChange={(c) => setEditLessonPreview(c === true)}
                disabled={savingLesson}
              />
              <div>
                <Label
                  htmlFor="editLessonPreview"
                  className="cursor-pointer text-sm font-medium"
                >
                  Free Preview
                </Label>
                <p className="text-xs text-muted-foreground">
                  Accessible without enrollment
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLessonToEdit(null)}
              disabled={savingLesson}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveLesson}
              disabled={!editLessonTitle.trim() || savingLesson}
              className="cursor-pointer"
            >
              {savingLesson && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Lesson Alert ───────────────────────────── */}
      <AlertDialog
        open={lessonToDelete !== null}
        onOpenChange={(open: boolean) => {
          if (!open) setLessonToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete "{lessonToDelete?.title}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              The lesson and its associated content (video or document from
              storage) will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingLesson}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLesson}
              disabled={deletingLesson}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingLesson && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Re-upload Video Modal ──────────────────────────── */}
      {reuploadLesson && (
        <ReuploadVideoModal
          open={reuploadLesson !== null}
          onOpenChange={(open) => {
            if (!open) setReuploadLesson(null);
          }}
          lessonId={reuploadLesson.id}
          currentTitle={reuploadLesson.title}
          onSuccess={() => {
            setReuploadLesson(null);
            onRefetch();
          }}
        />
      )}

      {/* ── Add External Video Dialog ─────────────────────── */}
      <Dialog
        open={addExternalVideoOpen}
        onOpenChange={setAddExternalVideoOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-rose-500/10 flex items-center justify-center">
                <ExternalLink className="h-3.5 w-3.5 text-rose-600" />
              </div>
              Add External Video Lesson
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="externalVideoTitle"
                className="text-sm font-medium"
              >
                Lesson Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="externalVideoTitle"
                value={externalVideoTitle}
                onChange={(e) => setExternalVideoTitle(e.target.value)}
                placeholder="e.g. Introduction — YouTube Demo"
                disabled={addingExternalVideo}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="externalVideoUrl" className="text-sm font-medium">
                Video URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="externalVideoUrl"
                value={externalVideoUrl}
                onChange={(e) => setExternalVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={addingExternalVideo}
              />
              <p className="text-xs text-muted-foreground">
                YouTube, Vimeo, or any other external video URL.
              </p>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border bg-muted/30 px-4 py-3">
              <Checkbox
                id="externalVideoPreview"
                checked={externalVideoPreview}
                onCheckedChange={(c) => setExternalVideoPreview(c === true)}
                disabled={addingExternalVideo}
              />
              <div>
                <Label
                  htmlFor="externalVideoPreview"
                  className="cursor-pointer text-sm font-medium"
                >
                  Free Preview
                </Label>
                <p className="text-xs text-muted-foreground">
                  Accessible without enrollment
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddExternalVideoOpen(false)}
              disabled={addingExternalVideo}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddExternalVideo}
              disabled={
                !externalVideoTitle.trim() ||
                !externalVideoUrl.trim() ||
                addingExternalVideo
              }
              className="cursor-pointer"
            >
              {addingExternalVideo ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Lesson
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ManageLessonsPage;
