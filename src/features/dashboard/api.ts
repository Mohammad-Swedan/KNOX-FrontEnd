import { apiClient } from "@/lib/api/apiClient";
import type { AnalyticsData, BackupFile } from "./types";

export async function fetchAnalyticsData(): Promise<AnalyticsData> {
  const response = await apiClient.get<AnalyticsData>("/dashboard/statistics");
  return response.data;
}

// ─── Backup API ───────────────────────────────────────────────────────────────

export async function listBackups(): Promise<BackupFile[]> {
  const response = await apiClient.get<BackupFile[]>("/backups");
  return response.data;
}

export async function createBackup(): Promise<BackupFile> {
  const response = await apiClient.post<BackupFile>("/backups");
  return response.data;
}

export async function downloadBackup(fileName: string): Promise<Blob> {
  const response = await apiClient.get(
    `/backups/${encodeURIComponent(fileName)}/download`,
    { responseType: "blob" },
  );
  return response.data as Blob;
}

export async function deleteBackup(fileName: string): Promise<void> {
  await apiClient.delete(`/backups/${encodeURIComponent(fileName)}`);
}
