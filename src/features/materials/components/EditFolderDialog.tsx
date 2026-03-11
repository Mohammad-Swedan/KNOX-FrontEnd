import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Loader2 } from "lucide-react";
import type { FolderItem } from "../types";

interface EditFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder: FolderItem | null;
  onSubmit: (
    folderId: number,
    payload: { name?: string; description?: string },
  ) => Promise<void> | void;
}

/** Inner form — remounted via `key` whenever a different folder is opened. */
function EditFolderForm({
  folder,
  onClose,
  onSubmit,
}: {
  folder: FolderItem;
  onClose: () => void;
  onSubmit: EditFolderDialogProps["onSubmit"];
}) {
  const [name, setName] = useState(folder.name);
  const [description, setDescription] = useState(folder.description ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setError(null);
    setLoading(false);
    onClose();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please provide a folder name.");
      return;
    }

    try {
      setLoading(true);
      await onSubmit(folder.id, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update folder");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Edit Folder</DialogTitle>
        <DialogDescription>
          Update the folder name and description.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="space-y-1.5">
          <Label htmlFor="edit-folder-name">Name *</Label>
          <Input
            id="edit-folder-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Folder name"
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-folder-desc">Description (optional)</Label>
          <Textarea
            id="edit-folder-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description"
            rows={2}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </DialogFooter>
    </form>
  );
}

export function EditFolderDialog({
  open,
  onOpenChange,
  folder,
  onSubmit,
}: EditFolderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        {folder && (
          <EditFolderForm
            key={folder.id}
            folder={folder}
            onClose={() => onOpenChange(false)}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default EditFolderDialog;
