import { Router } from 'express';
import { createUser, getAllUsers, loginUser } from 'controllers/user';

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
