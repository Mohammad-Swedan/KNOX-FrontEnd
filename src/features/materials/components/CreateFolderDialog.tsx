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
import { Loader2 } from "lucide-react";

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, description?: string) => Promise<void> | void;
}

export function CreateFolderDialog({ open, onOpenChange, onSubmit }: CreateFolderDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setDescription("");
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
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
      await onSubmit(name.trim(), description.trim() || undefined);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create folder");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Folder</DialogTitle>
            <DialogDescription>Enter a name and optional description for the new folder.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div>
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Folder name"
                autoFocus
              />
            </div>

            <div>
              <Label>Description (optional)</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateFolderDialog;
