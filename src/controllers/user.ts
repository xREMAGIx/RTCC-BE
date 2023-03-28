import { NextFunction, Request, Response } from 'express';
import { UserService } from 'services/user';

const userService = new UserService();

export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json({ data: users });
    } catch (error) {
        next(error);
    }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.params.id;
        const user = await userService.getUserById(userId);
        res.status(200).json({ data: user });
    } catch (error) {
        next(error);
    }
};

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userData = req.body;
        const user = await userService.createUser(userData);
        res.status(201).json({ data: user });
    } catch (error) {
        next(error);
    }
}

export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userData = req.body;
        const user = await userService.loginUser(userData);
        res.status(200).json({ data: user });
    } catch (error) {
        next(error);
    }
}

export const getProfileUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { userId } = req.body;
        const user = await userService.getUserById(userId);
        res.status(200).json({ data: user });
    } catch (error) {
        next(error);
    }
}