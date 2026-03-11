export type FolderItem = {
  id: number;
  name: string;
  courseId: number;
  parentFolderId: number | null;
  description: string | null;
};

export type MaterialItem = {
  id: number;
  title: string;
  contentUrl: string;
  courseId: number;
  folderId: number | null;
  description: string | null;
  tags: string[];
};

export type FolderContentsResponse = {
  courseId: number;
  folderId: number | null;
  folders: FolderItem[];
  materials: MaterialItem[];
};

export type CourseMaterialsResponse = {
  courseId: number;
  folderId: number | null;
  folders: FolderItem[];
  materials: MaterialItem[];
};
