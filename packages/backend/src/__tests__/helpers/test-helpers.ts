/**
 * Вспомогательные функции для тестов
 */

import { AuthRequest } from '../../middlewares/auth';

/**
 * Создание мокового пользователя
 */
export const createMockUser = (overrides?: Partial<{ id: string; email: string }>) => ({
  id: 'user-123',
  email: 'test@example.com',
  ...overrides,
});

/**
 * Создание мокового AuthRequest
 */
export const createMockAuthRequest = (user?: { id: string; email: string }): AuthRequest => {
  return {
    user: user || createMockUser(),
    headers: {},
    body: {},
    params: {},
    query: {},
  } as unknown as AuthRequest;
};

/**
 * Создание моковой заметки
 */
export const createMockNote = (overrides?: Partial<any>) => ({
  id: 'note-123',
  userId: 'user-123',
  title: 'Test Note',
  content: 'Test Content',
  isArchived: false,
  deletedAt: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

