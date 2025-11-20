import { Router } from 'express';
import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} from '../controllers/notesController';
import { authMiddleware } from '../middlewares/auth';

export const notesRoutes = Router();

// Все маршруты требуют аутентификации
notesRoutes.use(authMiddleware);

notesRoutes.get('/', getNotes);
notesRoutes.get('/:id', getNoteById);
notesRoutes.post('/', createNote);
notesRoutes.put('/:id', updateNote);
notesRoutes.delete('/:id', deleteNote);
