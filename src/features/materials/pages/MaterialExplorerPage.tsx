import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/shared/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";
import SEO from "@/shared/components/seo/SEO";
import { useUserRole } from "@/hooks/useUserRole";
import { useCourseMaterials } from "../hooks/useCourseMaterials";
import { MaterialExplorerHeader } from "../components/MaterialExplorerHeader";
import { MaterialExplorerContent } from "../components/MaterialExplorerContent";
import { CreateFolderDialog } from "../components/CreateFolderDialog";
import { AddMaterialDialog } from "../components/AddMaterialDialog";
import { EditMaterialDialog } from "../components/EditMaterialDialog";
import { EditFolderDialog } from "../components/EditFolderDialog";
import {
  createFolder,
  createMaterial,
  updateMaterial,
  updateFolder,
  deleteFolder,
  deleteMaterial,
} from "../api";
import type { FolderItem, MaterialItem } from "../types";
import { addLesson } from "@/features/product-courses/api";

interface MaterialExplorerProps {
  mode?: "public" | "manage";
}

export default function MaterialExplorerPage({
  mode = "public",
}: MaterialExplorerProps) {
  const { courseId } = useParams<{ courseId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { canManageContent } = useUserRole();

  // Check if user can see management UI
  const isManagementMode = mode === "manage" && canManageContent();

  // Product-course lesson integration (mirrors AddQuizPage pattern)
  const productCourseIdParam = searchParams.get("productCourseId");
  const topicIdParam = searchParams.get("topicId");
  const lessonTitle = searchParams.get("lessonTitle");
  const lessonOrder = searchParams.get("lessonOrder");
  const lessonIsFree = searchParams.get("lessonIsFree") === "true";
  const returnTo = searchParams.get("returnTo");
  const productCourseId = productCourseIdParam
    ? parseInt(productCourseIdParam)
    : undefined;
  const topicId = topicIdParam ? parseInt(topicIdParam) : undefined;

  const { loading, contents, error, refetch } = useCourseMaterials({
    courseId,
    isManagementMode,
  });

  // ── Dialog state ──────────────────────────────────────────────────────────
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  // Auto-open the upload dialog when arriving from the product-course lesson flow
  const [showAddMaterialDialog, setShowAddMaterialDialog] = useState(
    () => !!(productCourseId && isManagementMode),
  );
  const [editingFolder, setEditingFolder] = useState<FolderItem | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<MaterialItem | null>(
    null,
  );

  // ── Create folder ─────────────────────────────────────────────────────────
  const handleCreateFolder = async (name: string, description?: string) => {
    if (!courseId) return;
    try {
      await createFolder({
        name,
        courseId: parseInt(courseId),
        description: description || null,
        parentFolderId: null,
      });
      toast.success("Folder created successfully!");
      refetch();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create folder",
      );
      throw err;
    }
  };

  // ── Add material ──────────────────────────────────────────────────────────
  const handleAddMaterial = async (payload: {
    title: string;
    contemtUrl: string;
    folderId?: number | null;
    description?: string;
    tags?: string[];
  }) => {
    if (!courseId) return;
    try {
      const newMaterial = await createMaterial(parseInt(courseId), payload);

      // Product-course lesson flow: also create the lesson and navigate back
      if (productCourseId && topicId && lessonTitle) {
        await addLesson(productCourseId, topicId, {
          title: lessonTitle,
          order: lessonOrder ? parseInt(lessonOrder) : 1,
          type: 2, // Material
          isFreePreview: lessonIsFree,
          referenceId: newMaterial.id,
        });
        toast.success("Material lesson added successfully!");
        navigate(
          returnTo ?? `/dashboard/product-courses/${productCourseId}/lessons`,
        );
        return;
      }

      toast.success("Material added successfully!");
      refetch();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to add material",
      );
      throw err;
    }
  };

  // ── Edit folder ───────────────────────────────────────────────────────────
  const handleUpdateFolder = async (
    folderId: number,
    payload: { name?: string; description?: string },
  ) => {
    if (!courseId) return;
    try {
      await updateFolder(parseInt(courseId), folderId, payload);
      toast.success("Folder updated successfully!");
      setEditingFolder(null);
      refetch();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update folder",
      );
      throw err;
    }
  };

  // ── Edit material ─────────────────────────────────────────────────────────
  const handleUpdateMaterial = async (
    materialId: number,
    payload: {
      title?: string;
      contentUrl?: string;
      description?: string;
      tags?: string[];
    },
  ) => {
    if (!courseId) return;
    try {
      await updateMaterial(parseInt(courseId), materialId, payload);
      toast.success("Material updated successfully!");
      setEditingMaterial(null);
      refetch();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update material",
      );
      throw err;
    }
  };

  // ── Delete folder ─────────────────────────────────────────────────────────
  const handleDeleteFolder = async (folderId: number) => {
    if (!courseId) return;
    try {
      await deleteFolder(parseInt(courseId), folderId);
      toast.success("Folder deleted.");
      refetch();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete folder",
      );
    }
  };

  // ── Delete material ───────────────────────────────────────────────────────
  const handleDeleteMaterial = async (materialId: number) => {
    if (!courseId) return;
    try {
      await deleteMaterial(parseInt(courseId), materialId);
      toast.success("Material deleted.");
      refetch();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete material",
      );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 sm:gap-3 py-12 sm:py-16">
        <SEO
          title={t("materials.explorer.title")}
          description={t("materials.explorer.description")}
        />
        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
        <p className="text-xs sm:text-sm text-muted-foreground">
          {t("materials.explorer.loading")}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <SEO
          title={t("materials.explorer.title")}
          description={t("materials.explorer.description")}
        />
        <Card className="p-6 sm:p-8 text-center bg-linear-to-br from-destructive/5 to-destructive/10 border-destructive/20">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-destructive" />
            </div>
            <p className="text-sm sm:text-base text-destructive font-medium">
              {error}
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="text-xs sm:text-sm h-8 sm:h-9"
            >
              {t("common.buttons.tryAgain")}
            </Button>
          </div>
        </Card>
      </>
    );
  }

  if (!contents || !courseId) return null;

  const totalItems = contents.folders.length + contents.materials.length;

  return (
    <>
      <SEO
        title={t("materials.explorer.title")}
        description={t("materials.explorer.description")}
      />
      <Card className="relative overflow-hidden border-border/50 bg-card/90 p-4 sm:p-6">
        <div className="absolute inset-0 -z-10 bg-linear-to-br from-primary/5 via-transparent to-secondary/10" />
        <div className="absolute right-8 top-6 hidden h-32 w-32 rounded-full bg-primary/20 blur-3xl sm:block" />

        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Product-course lesson banner */}
          {productCourseId && isManagementMode && (
            <div className="p-4 rounded-xl border bg-amber-500/5 border-amber-200 dark:border-amber-900 space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                  Product Course Material
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
              <p className="text-xs text-muted-foreground">
                Upload a new material below — it will be automatically linked as
                a{" "}
                <span className="font-medium">
                  {lessonIsFree ? "free preview" : "paid"}
                </span>{" "}
                lesson.
              </p>
            </div>
          )}

          <MaterialExplorerHeader
            courseId={courseId}
            totalItems={totalItems}
            isManagementMode={isManagementMode}
            onAddFolder={() => setShowCreateFolderDialog(true)}
            onAddMaterial={() => setShowAddMaterialDialog(true)}
          />

          <MaterialExplorerContent
            folders={contents.folders}
            materials={contents.materials}
            courseId={courseId}
            isManagementMode={isManagementMode}
            onEditFolder={(folder) => setEditingFolder(folder)}
            onDeleteFolder={handleDeleteFolder}
            onEditMaterial={(material) => setEditingMaterial(material)}
            onDeleteMaterial={handleDeleteMaterial}
          />
        </div>
      </Card>

      {/* Create Folder dialog */}
      <CreateFolderDialog
        open={showCreateFolderDialog}
        onOpenChange={setShowCreateFolderDialog}
        onSubmit={handleCreateFolder}
      />

      {/* Add Material dialog */}
      <AddMaterialDialog
        open={showAddMaterialDialog}
        onOpenChange={setShowAddMaterialDialog}
        defaultFolderId={null}
        onSubmit={handleAddMaterial}
      />

      {/* Edit Folder dialog */}
      <EditFolderDialog
        open={editingFolder !== null}
        onOpenChange={(open: boolean) => {
          if (!open) setEditingFolder(null);
        }}
        folder={editingFolder}
        onSubmit={handleUpdateFolder}
      />

      {/* Edit Material dialog */}
      <EditMaterialDialog
        open={editingMaterial !== null}
        onOpenChange={(open: boolean) => {
          if (!open) setEditingMaterial(null);
        }}
        material={editingMaterial}
        onSubmit={handleUpdateMaterial}
      />
    </>
  );
}
