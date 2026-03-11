import { useParams } from "react-router-dom";
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

interface FolderPageProps {
  mode?: "public" | "manage";
}

export default function FolderPage({ mode = "public" }: FolderPageProps) {
  const { courseId, folderId } = useParams<{
    courseId: string;
    folderId: string;
  }>();
  const { canManageContent } = useUserRole();

  // Check if user can see management UI
  const isManagementMode = mode === "manage" && canManageContent();

  const { contents, loading, error, refetch } = useFolderContents({
    courseId,
    folderId,
    isManagementMode,
  });

  // ── Dialog state ──────────────────────────────────────────────────────────
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [showAddMaterialDialog, setShowAddMaterialDialog] = useState(false);
  const [editingFolder, setEditingFolder] = useState<FolderItem | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<MaterialItem | null>(
    null,
  );

  // ── Create sub-folder ─────────────────────────────────────────────────────
  const handleCreateFolder = async (name: string, description?: string) => {
    if (!courseId) return;
    try {
      await createFolder({
        name,
        courseId: parseInt(courseId),
        description: description || null,
        // Nest inside the current folder
        parentFolderId: folderId ? parseInt(folderId) : null,
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
      await createMaterial(parseInt(courseId), payload);
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
    folderIdToUpdate: number,
    payload: { name?: string; description?: string },
  ) => {
    if (!courseId) return;
    try {
      await updateFolder(parseInt(courseId), folderIdToUpdate, payload);
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
  const handleDeleteFolder = async (folderIdToDelete: number) => {
    if (!courseId) return;
    try {
      await deleteFolder(parseInt(courseId), folderIdToDelete);
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
        onAddFolder={() => setShowCreateFolderDialog(true)}
        onAddMaterial={() => setShowAddMaterialDialog(true)}
      />

      <div className="space-y-6">
        <FoldersList
          folders={contents.folders}
          courseId={courseId!}
          isManagementMode={isManagementMode}
          onEdit={(folder) => setEditingFolder(folder)}
          onDelete={handleDeleteFolder}
        />

        <MaterialsList
          materials={contents.materials}
          isManagementMode={isManagementMode}
          onEdit={(material) => setEditingMaterial(material)}
          onDelete={handleDeleteMaterial}
        />

        {isEmpty && <EmptyState />}
      </div>

      {/* Create sub-folder dialog */}
      <CreateFolderDialog
        open={showCreateFolderDialog}
        onOpenChange={setShowCreateFolderDialog}
        onSubmit={handleCreateFolder}
      />

      {/* Add Material dialog — defaultFolderId places it in the current folder */}
      <AddMaterialDialog
        open={showAddMaterialDialog}
        onOpenChange={setShowAddMaterialDialog}
        defaultFolderId={folderId ? parseInt(folderId) : null}
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
    </div>
  );
}
