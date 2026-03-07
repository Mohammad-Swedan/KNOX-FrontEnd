import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Plus, Video, HelpCircle, FileText, Loader2,
  BookOpen, ChevronDown, ChevronRight, FolderOpen, GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useCourseOutline, useProductCourse } from "../hooks/useProductCourses";
import { useUserRole } from "@/hooks/useUserRole";
import { addTopic } from "../api";
import VideoLessonModal from "../components/VideoLessonModal";
import type { TopicOutlineDto, LessonOutlineDto } from "../types";

const LessonTypeIcon = ({ type }: { type: number }) => {
  switch (type) {
    case 0:
      return <Video className="h-3.5 w-3.5 text-blue-600" />;
    case 1:
      return <HelpCircle className="h-3.5 w-3.5 text-violet-600" />;
    case 2:
      return <FileText className="h-3.5 w-3.5 text-amber-600" />;
    default:
      return <FileText className="h-3.5 w-3.5 text-muted-foreground" />;
  }
};

const LessonTypeBg = ({ type }: { type: number }) => {
  switch (type) {
    case 0:
      return "bg-blue-500/10";
    case 1:
      return "bg-violet-500/10";
    case 2:
      return "bg-amber-500/10";
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

  const { course } = useProductCourse(courseId);
  const { outline, loading, refetch } = useCourseOutline(courseId);

  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(
    new Set()
  );
  const [addTopicOpen, setAddTopicOpen] = useState(false);
  const [topicTitle, setTopicTitle] = useState("");
  const [addingTopic, setAddingTopic] = useState(false);

  const [videoModal, setVideoModal] = useState<{
    open: boolean;
    videoId: number;
    lessonTitle: string;
  }>({ open: false, videoId: 0, lessonTitle: "" });

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

  const handleLessonClick = (lesson: LessonOutlineDto) => {
    // In manage mode, preview behavior is limited
    // Video lessons can be previewed via modal
    if (lesson.type === 0) {
      // For now just show info - video preview would need referenceId which outline doesn't have
      toast.info(`Video lesson: ${lesson.title}`);
    } else if (lesson.type === 1) {
      toast.info(`Quiz lesson: ${lesson.title}`);
    } else {
      toast.info(`Document lesson: ${lesson.title}`);
    }
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
        <div className="flex items-start justify-between mb-8">
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

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Loading curriculum…
            </p>
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

      {/* Video player modal */}
      <VideoLessonModal
        open={videoModal.open}
        onClose={() => setVideoModal((s) => ({ ...s, open: false }))}
        videoId={videoModal.videoId}
        lessonTitle={videoModal.lessonTitle}
      />
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
}: {
  topic: TopicOutlineDto;
  expanded: boolean;
  onToggle: () => void;
  onLessonClick: (lesson: LessonOutlineDto) => void;
  canManage: boolean;
  dashboardId: string;
}) {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Topic header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/30 transition-colors cursor-pointer"
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

        {canManage && (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer gap-1.5 h-8 text-xs"
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
                      `/dashboard/product-courses/${dashboardId}/topics/${topic.id}/lessons/add-video`
                    )
                  }
                >
                  <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Video className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  Video Lesson
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2.5 cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/dashboard/product-courses/${dashboardId}/topics/${topic.id}/lessons/add-quiz`
                    )
                  }
                >
                  <div className="w-6 h-6 rounded-md bg-violet-500/10 flex items-center justify-center shrink-0">
                    <HelpCircle className="h-3.5 w-3.5 text-violet-600" />
                  </div>
                  Quiz Lesson
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2.5 cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/dashboard/product-courses/${dashboardId}/topics/${topic.id}/lessons/add-material`
                    )
                  }
                >
                  <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center shrink-0">
                    <FileText className="h-3.5 w-3.5 text-amber-600" />
                  </div>
                  Material Lesson
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </button>

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
                  <button
                    key={lesson.id}
                    onClick={() => onLessonClick(lesson)}
                    className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-muted/20 transition-colors cursor-pointer"
                  >
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
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
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ManageLessonsPage;
