// ─── Top Contributors ────────────────────────────────────────────────────────

export interface TopContributor {
  rank: number;
  userId: number;
  name: string;
  profilePictureUrl: string | null;
  majorName: string;
  facultyName: string;
  universityName: string;
  materialsCount: number;
  quizzesCount: number;
  coursesCount: number;
  totalCount: number;
}

export type ContributorScope = "global" | "university" | "faculty" | "major";

export interface TopContributorsFilter {
  topN?: number;
  majorId?: number;
  facultyId?: number;
  universityId?: number;
}

// ─── Backup ───────────────────────────────────────────────────────────────────

export interface BackupFile {
  fileName: string;
  fileSizeBytes: number;
  createdAt: string;
}

export interface AnalyticsData {
  totalUniversities: number;
  totalFaculties: number;
  totalMajors: number;
  totalCourses: number;
  totalQuizzes: number;
  totalMaterials: number;
  totalUsers: number;
  quizzesGrowth: { month: string; count: number }[];
  materialsGrowth: { month: string; count: number }[];
  usersGrowth: { month: string; count: number }[];
  activeQuizAttemptsLast30Days: number;
  averageMaterialsPerCourse: number;
  averageQuizzesPerCourse: number;
}
