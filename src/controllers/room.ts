import { NextFunction, Request, Response } from 'express';
import { RoomService } from 'services/room';

const roomService = new RoomService();

export const getAllRooms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { userId } = req.body;
        const rooms = await roomService.getAllRooms(userId);
        res.status(200).json({ data: rooms });
    } catch (error) {
        next(error);
    }
};

export const getRoomById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const roomId = req.params.id;
        const room = await roomService.getRoomById(roomId);
        res.status(200).json({ data: room });
    } catch (error) {
        next(error);
    }
};

export const createRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const roomData = req.body;
        const room = await roomService.createRoom(roomData);
        res.status(200).json({ data: room });
    } catch (error) {
        next(error);
    }
}

export const deleteRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const roomId = req.params.id;
        const room = await roomService.deleteRoom(roomId);
        res.status(200).json({ data: room });
    } catch (error) {
        next(error);
    }
}
