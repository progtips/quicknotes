import { Request, Response, NextFunction } from 'express';
import { createMockPrisma, MockPrisma } from '../helpers/prisma.mock';
import { createMockUser, createMockNote, createMockAuthRequest } from '../helpers/test-helpers';

// Мокируем Prisma перед импортом контроллера
const mockPrismaInstance = createMockPrisma();
jest.mock('../../utils/prisma', () => ({
  __esModule: true,
  default: mockPrismaInstance,
}));

import { getNotes, getNoteById, createNote, updateNote, deleteNote } from '../../controllers/notesController';

describe('NotesController', () => {
  let mockPrisma: MockPrisma;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockPrisma = mockPrismaInstance;
    mockRequest = createMockAuthRequest();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();

    // Очистка всех моков перед каждым тестом
    jest.clearAllMocks();
  });

  describe('getNotes', () => {
    it('должен возвращать список заметок текущего пользователя', async () => {
      const user = createMockUser();
      const notes = [
        createMockNote({ id: 'note-1', userId: user.id }),
        createMockNote({ id: 'note-2', userId: user.id }),
      ];

      mockRequest = createMockAuthRequest(user);
      mockRequest.query = {};

      mockPrisma.note.findMany.mockResolvedValue(notes);

      await getNotes(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPrisma.note.findMany).toHaveBeenCalledWith({
        where: {
          userId: user.id,
          deletedAt: null,
          isArchived: false,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: { notes },
      });
    });

    it('должен фильтровать архивные заметки по умолчанию', async () => {
      const user = createMockUser();
      mockRequest = createMockAuthRequest(user);
      mockRequest.query = {};

      mockPrisma.note.findMany.mockResolvedValue([]);

      await getNotes(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPrisma.note.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isArchived: false,
          }),
        })
      );
    });

    it('должен включать архивные заметки при includeArchived=true', async () => {
      const user = createMockUser();
      mockRequest = createMockAuthRequest(user);
      mockRequest.query = { includeArchived: 'true' };

      mockPrisma.note.findMany.mockResolvedValue([]);

      await getNotes(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPrisma.note.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({
            isArchived: expect.anything(),
          }),
        })
      );
    });

    it('должен возвращать только заметки текущего пользователя', async () => {
      const user1 = createMockUser({ id: 'user-1' });

      mockRequest = createMockAuthRequest(user1);
      mockRequest.query = {};

      mockPrisma.note.findMany.mockResolvedValue([]);

      await getNotes(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPrisma.note.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-1',
          }),
        })
      );
    });
  });

  describe('getNoteById', () => {
    it('должен возвращать заметку по ID', async () => {
      const user = createMockUser();
      const note = createMockNote({ id: 'note-123', userId: user.id });

      mockRequest = createMockAuthRequest(user);
      mockRequest.params = { id: 'note-123' };

      mockPrisma.note.findFirst.mockResolvedValue(note);

      await getNoteById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPrisma.note.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'note-123',
          userId: user.id,
          deletedAt: null,
        },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: { note },
      });
    });

    it('должен возвращать 404 если заметка не найдена', async () => {
      const user = createMockUser();
      mockRequest = createMockAuthRequest(user);
      mockRequest.params = { id: 'non-existent' };

      mockPrisma.note.findFirst.mockResolvedValue(null);

      await getNoteById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Заметка не найдена',
      });
    });

    it('не должен возвращать заметки других пользователей', async () => {
      const user1 = createMockUser({ id: 'user-1' });

      mockRequest = createMockAuthRequest(user1);
      mockRequest.params = { id: 'note-123' };

      mockPrisma.note.findFirst.mockResolvedValue(null);

      await getNoteById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPrisma.note.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'note-123',
          userId: 'user-1',
          deletedAt: null,
        },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe('createNote', () => {
    it('должен создавать новую заметку', async () => {
      const user = createMockUser();
      const noteData = { title: 'New Note', content: 'Content' };
      const createdNote = createMockNote({ ...noteData, userId: user.id });

      mockRequest = createMockAuthRequest(user);
      mockRequest.body = noteData;

      mockPrisma.note.create.mockResolvedValue(createdNote);

      await createNote(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPrisma.note.create).toHaveBeenCalledWith({
        data: {
          title: noteData.title,
          content: noteData.content,
          userId: user.id,
        },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: { note: createdNote },
      });
    });

    it('должен валидировать обязательное поле title', async () => {
      const user = createMockUser();
      mockRequest = createMockAuthRequest(user);
      mockRequest.body = { content: 'Content without title' };

      await createNote(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockPrisma.note.create).not.toHaveBeenCalled();
    });

    it('должен использовать пустую строку для content по умолчанию', async () => {
      const user = createMockUser();
      const noteData = { title: 'Note without content' };
      const createdNote = createMockNote({ ...noteData, content: '', userId: user.id });

      mockRequest = createMockAuthRequest(user);
      mockRequest.body = noteData;

      mockPrisma.note.create.mockResolvedValue(createdNote);

      await createNote(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPrisma.note.create).toHaveBeenCalledWith({
        data: {
          title: noteData.title,
          content: '',
          userId: user.id,
        },
      });
    });
  });

  describe('updateNote', () => {
    it('должен обновлять заметку', async () => {
      const user = createMockUser();
      const existingNote = createMockNote({ id: 'note-123', userId: user.id });
      const updateData = { title: 'Updated Title', content: 'Updated Content' };
      const updatedNote = { ...existingNote, ...updateData };

      mockRequest = createMockAuthRequest(user);
      mockRequest.params = { id: 'note-123' };
      mockRequest.body = updateData;

      mockPrisma.note.findFirst.mockResolvedValue(existingNote);
      mockPrisma.note.update.mockResolvedValue(updatedNote);

      await updateNote(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPrisma.note.update).toHaveBeenCalledWith({
        where: { id: 'note-123' },
        data: updateData,
      });

      expect(mockResponse.json).toHaveBeenCalledWith({
        data: { note: updatedNote },
      });
    });

    it('должен обновлять только переданные поля', async () => {
      const user = createMockUser();
      const existingNote = createMockNote({ id: 'note-123', userId: user.id });
      const updateData = { title: 'Updated Title' };

      mockRequest = createMockAuthRequest(user);
      mockRequest.params = { id: 'note-123' };
      mockRequest.body = updateData;

      mockPrisma.note.findFirst.mockResolvedValue(existingNote);
      mockPrisma.note.update.mockResolvedValue({ ...existingNote, ...updateData });

      await updateNote(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPrisma.note.update).toHaveBeenCalledWith({
        where: { id: 'note-123' },
        data: { title: 'Updated Title' },
      });
    });

    it('должен архивировать заметку', async () => {
      const user = createMockUser();
      const existingNote = createMockNote({ id: 'note-123', userId: user.id });
      const updateData = { isArchived: true };

      mockRequest = createMockAuthRequest(user);
      mockRequest.params = { id: 'note-123' };
      mockRequest.body = updateData;

      mockPrisma.note.findFirst.mockResolvedValue(existingNote);
      mockPrisma.note.update.mockResolvedValue({ ...existingNote, isArchived: true });

      await updateNote(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPrisma.note.update).toHaveBeenCalledWith({
        where: { id: 'note-123' },
        data: { isArchived: true },
      });
    });

    it('должен возвращать 404 если заметка не найдена', async () => {
      const user = createMockUser();
      mockRequest = createMockAuthRequest(user);
      mockRequest.params = { id: 'non-existent' };
      mockRequest.body = { title: 'Updated' };

      mockPrisma.note.findFirst.mockResolvedValue(null);

      await updateNote(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockPrisma.note.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteNote', () => {
    it('должен выполнять мягкое удаление заметки', async () => {
      const user = createMockUser();
      const existingNote = createMockNote({ id: 'note-123', userId: user.id });
      const deletedNote = { ...existingNote, deletedAt: new Date() };

      mockRequest = createMockAuthRequest(user);
      mockRequest.params = { id: 'note-123' };

      mockPrisma.note.findFirst.mockResolvedValue(existingNote);
      mockPrisma.note.update.mockResolvedValue(deletedNote);

      await deleteNote(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPrisma.note.update).toHaveBeenCalledWith({
        where: { id: 'note-123' },
        data: {
          deletedAt: expect.any(Date),
        },
      });

      expect(mockResponse.json).toHaveBeenCalledWith({
        data: { note: deletedNote },
      });
    });

    it('должен возвращать 404 если заметка не найдена', async () => {
      const user = createMockUser();
      mockRequest = createMockAuthRequest(user);
      mockRequest.params = { id: 'non-existent' };

      mockPrisma.note.findFirst.mockResolvedValue(null);

      await deleteNote(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockPrisma.note.update).not.toHaveBeenCalled();
    });
  });
});

