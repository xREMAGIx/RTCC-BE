import { Api404Error, Api500Error } from "middleware/errorHandler";
import { CreateRoomParams, IRoom, Room } from 'models/room';

export interface JoinRoomParams {
    code: string;
}

export interface JoinRoomData {
    room: IRoom;
}

export class RoomService {
    // Get all rooms
    async getAllRooms(userId: string): Promise<IRoom[]> {
        try {
            const rooms = await Room.getAll(userId);
            return rooms;
        } catch (error) {
            throw new Api500Error();
        }
    }

    // Get a room by ID
    async getRoomById(roomId: string): Promise<Partial<IRoom>> {
        try {
            const room = await Room.getById(roomId);
            if (!room) {
                throw new Api404Error(`Room with id: ${roomId} not found`)
            }
            const resRoom = { ...room } as Partial<IRoom>;
            delete resRoom.password;
            return resRoom;
        } catch (error) {
            throw new Api500Error();
        }
    }

    // Get a room by code
    async getRoomByCode(roomCode: string): Promise<Partial<IRoom>> {
        try {
            const room = await Room.getByCode(roomCode);
            if (!room) {
                throw new Api404Error(`Room with code: ${roomCode} not found`)
            }
            const resRoom = { ...room } as Partial<IRoom>;
            delete resRoom.password;
            return resRoom;
        } catch (error) {
            throw new Api500Error();
        }
    }

    // Create a new room
    async createRoom(params: CreateRoomParams): Promise<IRoom> {
        const room = await Room.createRoom(params);
        return room;
    }

    // Update an existing room
    async updateRoom(roomId: string, roomData: Omit<IRoom, "id" | "password">): Promise<IRoom | null> {
        const newRoom = await Room.update({ id: roomId, roomData });
        return newRoom;
    }

    // Delete a room
    async deleteRoom(id: string): Promise<void> {
        await Room.delete(id);
    }
}
