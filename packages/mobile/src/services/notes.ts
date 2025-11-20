import { api } from './api';

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

export interface NotesResponse {
  notes: Note[];
}

export interface NoteResponse {
  note: Note;
}

export const getNotes = async (includeArchived = false) => {
  const response = await api.get<{ data: NotesResponse }>(
    `/notes?includeArchived=${includeArchived}`
  );
  return response.data;
};

export const getNoteById = async (id: string) => {
  const response = await api.get<{ data: NoteResponse }>(`/notes/${id}`);
  return response.data;
};

export const createNote = async (data: { title: string; content: string }) => {
  const response = await api.post<{ data: NoteResponse }>('/notes', data);
  return response.data;
};

export const updateNote = async (
  id: string,
  data: { title?: string; content?: string; isArchived?: boolean }
) => {
  const response = await api.put<{ data: NoteResponse }>(`/notes/${id}`, data);
  return response.data;
};

export const deleteNote = async (id: string) => {
  const response = await api.delete<{ data: NoteResponse }>(`/notes/${id}`);
  return response.data;
};

