import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/auth';
import { sendSuccess, sendError } from '../utils/response';
import prisma from '../utils/prisma';

const createNoteSchema = z.object({
  title: z.string().min(1, 'Заголовок обязателен'),
  content: z.string().default(''),
});

const updateNoteSchema = z.object({
  title: z.string().min(1, 'Заголовок обязателен').optional(),
  content: z.string().optional(),
  isArchived: z.boolean().optional(),
});

export const getNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const user = authReq.user;

    if (!user) {
      sendError(res, 'Не авторизован', 401);
      return;
    }

    const { includeArchived } = req.query;
    const shouldIncludeArchived = includeArchived === 'true';

    const where: {
      userId: string;
      deletedAt: null;
      isArchived?: boolean;
    } = {
      userId: user.id,
      deletedAt: null,
    };

    // Если includeArchived не указан или false, показываем только неархивированные
    if (!shouldIncludeArchived) {
      where.isArchived = false;
    }

    const notes = await prisma.note.findMany({
      where,
      orderBy: {
        updatedAt: 'desc',
      },
    });

    sendSuccess(res, { notes });
  } catch (error) {
    next(error);
  }
};

export const getNoteById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const user = authReq.user;

    if (!user) {
      sendError(res, 'Не авторизован', 401);
      return;
    }

    const { id } = req.params;

    const note = await prisma.note.findFirst({
      where: {
        id,
        userId: user.id,
        deletedAt: null,
      },
    });

    if (!note) {
      sendError(res, 'Заметка не найдена', 404);
      return;
    }

    sendSuccess(res, { note });
  } catch (error) {
    next(error);
  }
};

export const createNote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const user = authReq.user;

    if (!user) {
      sendError(res, 'Не авторизован', 401);
      return;
    }

    const data = createNoteSchema.parse(req.body);

    const note = await prisma.note.create({
      data: {
        title: data.title,
        content: data.content,
        userId: user.id,
      },
    });

    sendSuccess(res, { note }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const user = authReq.user;

    if (!user) {
      sendError(res, 'Не авторизован', 401);
      return;
    }

    const { id } = req.params;
    const data = updateNoteSchema.parse(req.body);

    // Проверка существования и принадлежности заметки
    const existingNote = await prisma.note.findFirst({
      where: {
        id,
        userId: user.id,
        deletedAt: null,
      },
    });

    if (!existingNote) {
      sendError(res, 'Заметка не найдена', 404);
      return;
    }

    const note = await prisma.note.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.isArchived !== undefined && { isArchived: data.isArchived }),
      },
    });

    sendSuccess(res, { note });
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const user = authReq.user;

    if (!user) {
      sendError(res, 'Не авторизован', 401);
      return;
    }

    const { id } = req.params;

    // Проверка существования и принадлежности заметки
    const existingNote = await prisma.note.findFirst({
      where: {
        id,
        userId: user.id,
        deletedAt: null,
      },
    });

    if (!existingNote) {
      sendError(res, 'Заметка не найдена', 404);
      return;
    }

    // Мягкое удаление - устанавливаем deletedAt
    const note = await prisma.note.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    sendSuccess(res, { note });
  } catch (error) {
    next(error);
  }
};
