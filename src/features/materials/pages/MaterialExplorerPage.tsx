import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card } from "@/shared/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import SEO from "@/shared/components/seo/SEO";
import { useUserRole } from "@/hooks/useUserRole";
import { useCourseMaterials } from "../hooks/useCourseMaterials";
import { MaterialExplorerHeader } from "../components/MaterialExplorerHeader";
import { MaterialExplorerContent } from "../components/MaterialExplorerContent";
import type { FolderItem, MaterialItem } from "../types";

interface MaterialExplorerProps {
  mode?: "public" | "manage";
}

export default function MaterialExplorerPage({
  mode = "public",
}: MaterialExplorerProps) {
  const { courseId } = useParams<{ courseId: string }>();
  const { t } = useTranslation();
  const { canManageContent } = useUserRole();

  // Check if user can see management UI
  const isManagementMode = mode === "manage" && canManageContent();

  const { loading, contents, error } = useCourseMaterials({
    courseId,
    isManagementMode,
  });

  // Management action handlers
  const handleAddFolder = () => {
    // TODO: Open add folder dialog
    console.log("Add folder clicked");
  };

  const handleAddMaterial = () => {
    // TODO: Open add material dialog
    console.log("Add material clicked");
  };

  const handleEditFolder = (folder: FolderItem) => {
    // TODO: Open edit folder dialog
    console.log("Edit folder:", folder.id);
  };

  const handleDeleteFolder = (folderId: number) => {
    // TODO: Confirm and delete folder
    console.log("Delete folder:", folderId);
  };

  const handleEditMaterial = (material: MaterialItem) => {
    // TODO: Open edit material dialog
    console.log("Edit material:", material.id);
  };

  const handleDeleteMaterial = (materialId: number) => {
    // TODO: Confirm and delete material
    console.log("Delete material:", materialId);
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
        <div className="absolute inset-0 -z-10 bg-linear-to-br from-primary/5 via-transparent to-purple-500/10" />
        <div className="absolute right-8 top-6 hidden h-32 w-32 rounded-full bg-primary/20 blur-3xl sm:block" />

        <div className="flex flex-col gap-4 sm:gap-6">
          <MaterialExplorerHeader
            courseId={courseId}
            totalItems={totalItems}
            isManagementMode={isManagementMode}
            onAddFolder={handleAddFolder}
            onAddMaterial={handleAddMaterial}
          />

          <MaterialExplorerContent
            folders={contents.folders}
            materials={contents.materials}
            courseId={courseId}
            isManagementMode={isManagementMode}
            onEditFolder={handleEditFolder}
            onDeleteFolder={handleDeleteFolder}
            onEditMaterial={handleEditMaterial}
            onDeleteMaterial={handleDeleteMaterial}
          />
        </div>
      </Card>
    </>
  );
}
