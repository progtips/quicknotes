export interface User {
  id: string;
  email: string;
  createdAt?: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  isArchived: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

