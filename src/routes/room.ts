import { createRoom, deleteRoom, getAllRooms, getRoomByCode } from 'controllers/room';
import { Router } from 'express';
import { authMiddleware } from 'middleware/auth';

export const roomRoutes = Router();

roomRoutes.get('/list', authMiddleware, async (req, res, next) => {
    await getAllRooms(req, res, next);
});

roomRoutes.get('/detail/:code', async (req, res, next) => {
    await getRoomByCode(req, res, next);
});

roomRoutes.post('/create', authMiddleware, async (req, res, next) => {
    await createRoom(req, res, next);
});

roomRoutes.delete('/delete/:id', authMiddleware, async (req, res, next) => {
    await deleteRoom(req, res, next);
});