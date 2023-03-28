import { createUser, getAllUsers, getProfileUser, loginUser } from 'controllers/user';
import { Router } from 'express';
import { authMiddleware } from 'middleware/auth';

export const userRoutes = Router();

userRoutes.get('/get-all', async (req, res, next) => {
    await getAllUsers(req, res, next);
});

userRoutes.post('/create', async (req, res, next) => {
    await createUser(req, res, next);
});

userRoutes.post('/login', async (req, res, next) => {
    await loginUser(req, res, next);
});

userRoutes.get('/profile', authMiddleware, async (req, res, next) => {
    await getProfileUser(req, res, next);
});
