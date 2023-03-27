import { Router } from 'express';

export const roomRoutes = Router();

roomRoutes.get('/list', (req, res) => {
    res.send("Room list");
});

roomRoutes.get('/detail', (req, res) => {
    res.send("Room detail");
});