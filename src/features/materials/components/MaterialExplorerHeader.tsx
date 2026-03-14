import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { ArrowLeft, Plus } from "lucide-react";
import ShareButton from "@/shared/ui/ShareButton";

interface MaterialExplorerHeaderProps {
  courseId: string;
  totalItems: number;
  isManagementMode: boolean;
  onAddFolder?: () => void;
  onAddMaterial?: () => void;
}

export function MaterialExplorerHeader({
  courseId,
  totalItems,
  isManagementMode,
  onAddFolder,
  onAddMaterial,
}: MaterialExplorerHeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2 mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("common.back", "Back")}
          </Button>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
            {t("materials.explorer.courseLabel", { courseId })}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight">
              {t("materials.explorer.title")}
            </h2>
            <ShareButton
              url={`/courses/${courseId}/materials`}
              title={`Check out Course #${courseId} Materials`}
              showText={false}
            />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t("materials.explorer.description")}
          </p>
        </div>

        {isManagementMode && (
          <div className="flex gap-1.5 sm:gap-2">
            <Button
              onClick={onAddFolder}
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm h-8 sm:h-9"
            >
              <Plus className="me-1.5 sm:me-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {t("materials.explorer.addFolder")}
            </Button>
            <Button
              onClick={onAddMaterial}
              size="sm"
              className="text-xs sm:text-sm h-8 sm:h-9"
            >
              <Plus className="me-1.5 sm:me-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {t("materials.explorer.addMaterial")}
            </Button>
          </div>
        )}

        <div className="rounded-xl sm:rounded-2xl border border-border/70 bg-background/60 px-3 py-2 sm:px-4 sm:py-3 shadow-sm">
          <p className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground">
            {t("materials.explorer.totalItems")}
          </p>
          <p className="text-xl sm:text-2xl font-semibold">{totalItems}</p>
        </div>
      </div>

      <Separator className="opacity-60" />
    </>
  );
}
