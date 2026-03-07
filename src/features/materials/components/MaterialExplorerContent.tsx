import { useTranslation } from "react-i18next";
import { Separator } from "@/shared/ui/separator";
import { Badge } from "@/shared/ui/badge";
import { FolderOpen, File as FileIcon } from "lucide-react";
import { FolderCard } from "./FolderCard";
import { MaterialCard } from "./MaterialCard";
import type { FolderItem, MaterialItem } from "../types";

interface MaterialExplorerContentProps {
  folders: FolderItem[];
  materials: MaterialItem[];
  courseId: string;
  isManagementMode: boolean;
  onEditFolder?: (folder: FolderItem) => void;
  onDeleteFolder?: (folderId: number) => void;
  onEditMaterial?: (material: MaterialItem) => void;
  onDeleteMaterial?: (materialId: number) => void;
}

export function MaterialExplorerContent({
  folders,
  materials,
  courseId,
  isManagementMode,
  onEditFolder = () => {},
  onDeleteFolder = () => {},
  onEditMaterial = () => {},
  onDeleteMaterial = () => {},
}: MaterialExplorerContentProps) {
  const { t } = useTranslation();
  const hasFolders = folders.length > 0;
  const hasMaterials = materials.length > 0;
  const isEmpty = !hasFolders && !hasMaterials;

  if (isEmpty) {
    return (
      <div className="rounded-xl sm:rounded-2xl border border-dashed border-border/70 bg-muted/30 p-8 sm:p-12 text-center">
        <p className="text-xs sm:text-sm text-muted-foreground">
          {t("materials.explorer.empty")}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Folders Section */}
      {hasFolders && (
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <h3 className="text-base sm:text-lg font-semibold">
              {t("materials.folder.title")}
            </h3>
            <Badge
              variant="secondary"
              className="rounded-full text-[10px] sm:text-xs"
            >
              {folders.length}
            </Badge>
          </div>
          <div className="grid gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {folders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                courseId={courseId}
                isManagementMode={isManagementMode}
                onEdit={onEditFolder}
                onDelete={onDeleteFolder}
              />
            ))}
          </div>
        </div>
      )}

      {/* Materials Section */}
      {hasMaterials && (
        <>
          {hasFolders && <Separator className="opacity-60" />}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <FileIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h3 className="text-base sm:text-lg font-semibold">
                {t("materials.card.files")}
              </h3>
              <Badge
                variant="secondary"
                className="rounded-full text-[10px] sm:text-xs"
              >
                {materials.length}
              </Badge>
            </div>
            <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
              {materials.map((material) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  isManagementMode={isManagementMode}
                  onEdit={onEditMaterial}
                  onDelete={onDeleteMaterial}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
