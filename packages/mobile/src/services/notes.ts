import { api, ApiResponse } from './api';

/**
 * Типы для заметок
 */
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

/**
 * Получить список заметок
 * @param includeArchived - включать ли архивные заметки (по умолчанию false)
 * @returns Список заметок
 */
export const getNotes = async (
  includeArchived = false
): Promise<ApiResponse<NotesResponse>> => {
  const response = await api.get<ApiResponse<NotesResponse>>(
    `/notes?includeArchived=${includeArchived}`
  );
  return response.data;
};

/**
 * Получить заметку по ID
 * @param id - ID заметки
 * @returns Данные заметки
 */
export const getNote = async (id: string): Promise<ApiResponse<NoteResponse>> => {
  const response = await api.get<ApiResponse<NoteResponse>>(`/notes/${id}`);
  return response.data;
};

/**
 * Создать новую заметку
 * @param data - title и content заметки
 * @returns Созданная заметка
 */
export const createNote = async (
  data: { title: string; content: string }
): Promise<ApiResponse<NoteResponse>> => {
  const response = await api.post<ApiResponse<NoteResponse>>('/notes', data);
  return response.data;
};

/**
 * Обновить заметку
 * @param id - ID заметки
 * @param data - Данные для обновления (title, content, isArchived)
 * @returns Обновленная заметка
 */
export const updateNote = async (
  id: string,
  data: { title?: string; content?: string; isArchived?: boolean }
): Promise<ApiResponse<NoteResponse>> => {
  const response = await api.put<ApiResponse<NoteResponse>>(`/notes/${id}`, data);
  return response.data;
};

/**
 * Удалить заметку (мягкое удаление)
 * @param id - ID заметки
 * @returns Удаленная заметка
 */
export const deleteNote = async (
  id: string
): Promise<ApiResponse<NoteResponse>> => {
  const response = await api.delete<ApiResponse<NoteResponse>>(`/notes/${id}`);
  return response.data;
};
