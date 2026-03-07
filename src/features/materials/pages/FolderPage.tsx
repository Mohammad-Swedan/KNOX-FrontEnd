import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { useFolderContents } from "../hooks/useFolderContents";
import { LoadingState, ErrorState } from "../components/PageStates";
import { FolderPageHeader } from "../components/FolderPageHeader";
import { FoldersList } from "../components/FoldersList";
import { MaterialsList } from "../components/MaterialsList";
import { EmptyState } from "../components/EmptyState";
import { CreateFolderDialog } from "../components/CreateFolderDialog";
import { createFolder } from "../api";

interface FolderPageProps {
  mode?: "public" | "manage";
}

export default function FolderPage({ mode = "public" }: FolderPageProps) {
  const { courseId, folderId } = useParams<{
    courseId: string;
    folderId: string;
  }>();
  const navigate = useNavigate();
  const { canManageContent } = useUserRole();

  // Check if user can see management UI
  const isManagementMode = mode === "manage" && canManageContent();

  const {
    contents,
    loading,
    error,
    handleDeleteFolder,
    handleDeleteMaterial,
    handleEditFolder,
    handleEditMaterial,
    refetch,
  } = useFolderContents({ courseId, folderId, isManagementMode });

  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);

  const handleAddFolder = () => {
    setShowCreateFolderDialog(true);
  };

  const handleCreateFolder = async (name: string, description?: string) => {
    if (!courseId) return;

    try {
      await createFolder({
        name,
        courseId: parseInt(courseId),
        description: description || null,
      });
      toast.success("Folder created successfully!");
      refetch();
    } catch (err) {
      console.error("Failed to create folder:", err);
      toast.error(err instanceof Error ? err.message : "Failed to create folder");
      throw err;
    }
  };

  const handleAddMaterial = () => {
    if (!courseId) return;
    navigate(`/dashboard/courses/${courseId}/materials/add`);
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!contents) return null;

  const isEmpty =
    contents.folders.length === 0 && contents.materials.length === 0;

  return (
    <div className="container mx-auto px-4 py-6">
      <FolderPageHeader
        courseId={courseId!}
        folderId={folderId}
        isManagementMode={isManagementMode}
        onAddFolder={handleAddFolder}
        onAddMaterial={handleAddMaterial}
      />

      <div className="space-y-6">
        <FoldersList
          folders={contents.folders}
          courseId={courseId!}
          isManagementMode={isManagementMode}
          onEdit={handleEditFolder}
          onDelete={handleDeleteFolder}
        />

        <MaterialsList
          materials={contents.materials}
          isManagementMode={isManagementMode}
          onEdit={handleEditMaterial}
          onDelete={handleDeleteMaterial}
        />

        {isEmpty && <EmptyState />}
      </div>

      <CreateFolderDialog
        open={showCreateFolderDialog}
        onOpenChange={setShowCreateFolderDialog}
        onSubmit={handleCreateFolder}
      />
    </div>
  );
}
