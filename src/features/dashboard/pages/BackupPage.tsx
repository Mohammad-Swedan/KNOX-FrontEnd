import { useState, useEffect, useCallback } from "react";
import {
  HardDriveDownload,
  Plus,
  Trash2,
  Download,
  RefreshCw,
  ShieldCheck,
  Calendar,
  HardDrive,
} from "lucide-react";
import { toast } from "sonner";

import SEO from "@/shared/components/seo/SEO";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

import {
  listBackups,
  createBackup,
  downloadBackup,
  deleteBackup,
} from "../api";
import type { BackupFile } from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Page Component ───────────────────────────────────────────────────────────

const BackupPage = () => {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const loadBackups = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listBackups();
      setBackups(data);
    } catch {
      toast.error("Failed to load backups.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBackups();
  }, [loadBackups]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const newBackup = await createBackup();
      toast.success(`Backup created: ${newBackup.fileName}`);
      await loadBackups();
    } catch {
      toast.error("Failed to create backup.");
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (fileName: string) => {
    setDownloadingFile(fileName);
    try {
      const blob = await downloadBackup(fileName);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Download started: ${fileName}`);
    } catch {
      toast.error("Failed to download backup.");
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeletingFile(deleteTarget);
    setDeleteTarget(null);
    try {
      await deleteBackup(deleteTarget);
      toast.success("Backup deleted.");
      setBackups((prev) => prev.filter((b) => b.fileName !== deleteTarget));
    } catch {
      toast.error("Failed to delete backup.");
    } finally {
      setDeletingFile(null);
    }
  };

  const lastBackup = backups[0];

  return (
    <div className="space-y-6">
      <SEO
        title="Database Backups"
        description="Manage database backups — create, download, or delete backup files."
      />

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10">
            <HardDriveDownload className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Database Backups
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage and restore database backup files. Backups run
              automatically every night at 00:00.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadBackups}
            disabled={loading}
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleCreate} disabled={creating} size="sm">
            <Plus className="size-4" />
            {creating ? "Creating…" : "Create Backup"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
            <HardDrive className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <p className="text-3xl font-bold">{backups.length}</p>
                <p className="text-muted-foreground text-xs">
                  of 10 maximum kept
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Latest Backup</CardTitle>
            <Calendar className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : lastBackup ? (
              <>
                <p className="text-sm font-semibold">
                  {formatDate(lastBackup.createdAt)}
                </p>
                <p className="text-muted-foreground text-xs">
                  {formatSize(lastBackup.fileSizeBytes)}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">No backups yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Retention Policy
            </CardTitle>
            <ShieldCheck className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">10</p>
            <p className="text-muted-foreground text-xs">
              most recent files kept
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Backup List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Backup Files</CardTitle>
            {!loading && (
              <Badge variant="secondary">{backups.length} file(s)</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md" />
              ))}
            </div>
          ) : backups.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <HardDrive className="text-muted-foreground size-10" />
              <p className="text-muted-foreground text-sm">
                No backup files found. Create one manually or wait for the
                nightly backup.
              </p>
              <Button onClick={handleCreate} disabled={creating} size="sm">
                <Plus className="size-4" />
                {creating ? "Creating…" : "Create First Backup"}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.map((backup) => (
                    <TableRow key={backup.fileName}>
                      <TableCell className="font-mono text-sm">
                        {backup.fileName}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatSize(backup.fileSizeBytes)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(backup.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(backup.fileName)}
                            disabled={downloadingFile === backup.fileName}
                          >
                            <Download className="size-4" />
                            {downloadingFile === backup.fileName
                              ? "Downloading…"
                              : "Download"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteTarget(backup.fileName)}
                            disabled={deletingFile === backup.fileName}
                          >
                            <Trash2 className="size-4" />
                            {deletingFile === backup.fileName
                              ? "Deleting…"
                              : "Delete"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Backup</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete{" "}
              <span className="font-mono font-semibold">{deleteTarget}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BackupPage;
