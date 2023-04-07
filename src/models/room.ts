import { TABLE_NAME } from 'config/table';
import { Api404Error } from 'middleware/errorHandler';
import { OkPacket, RowDataPacket } from "mysql2";
import { getConnection } from 'utils/database';
import { v4 as uuidv4 } from 'uuid';

export interface IRoom extends RowDataPacket {
    id: number;
    code: string;
    create_user_id: number;
    name: string;
    description?: string;
    created_at: Date;
    updated_at: Date;
    ydoc: string;
}

export interface CreateRoomParams {
    userId: string;
    name: string;
    description: string;
}

class RoomModel {
    async findRoomByCode(code: string): Promise<IRoom | null> {
        const connection = await getConnection();

        try {
            const [rows] = await connection.query<IRoom[]>(`SELECT * FROM ${TABLE_NAME.ROOM} WHERE code = ?`, [code]);
            if (rows.length) {
                return rows[0];
            }
            return null;
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async createRoom(params: CreateRoomParams): Promise<IRoom> {
        const connection = await getConnection();

        try {
            const { userId, name, description } = params;
            const uuid4 = uuidv4()
            const [result] = await connection.execute<OkPacket>(`INSERT INTO ${TABLE_NAME.ROOM} (code, created_user_id, name, description) VALUES (?, ?, ?, ?)`, [uuid4, userId, name, description || '']);
            const insertedId = result.insertId;

            const [rows] = await connection.query<IRoom[]>(`SELECT * FROM ${TABLE_NAME.ROOM} WHERE id = ?`, [insertedId]);
            const room = rows[0];
            return room;

        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async getAll(userId: string) {
        try {
            const connection = await getConnection();

            const [rows] = await connection.query<IRoom[]>(`SELECT * FROM ${TABLE_NAME.ROOM} WHERE created_user_id = ?`, [userId]);

            connection.release();
            return rows;
        } catch (error) {
            throw error;
        }
    }

    async getById(id: string): Promise<IRoom | null> {
        const connection = await getConnection();

        try {
            const [rows] = await connection.query<IRoom[]>(`SELECT * FROM ${TABLE_NAME.ROOM} WHERE id = ?`, [id]);

            if (rows.length) {
                return rows[0];
            }

            return null;
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async getByCode(code: string): Promise<IRoom | null> {
        const connection = await getConnection();
        try {
            const [rows] = await connection.query<IRoom[]>(`SELECT * FROM ${TABLE_NAME.ROOM} WHERE code = ?`, [code]);

            if (rows.length) {
                return rows[0];
            }
            return null;
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async update(roomData: Omit<IRoom, "password">): Promise<IRoom | null> {
        const connection = await getConnection();
        try {
            const { id, email } = roomData;
            const [rows] = await connection.query<IRoom[]>(`SELECT * FROM ${TABLE_NAME.ROOM} WHERE id = ?`, [id]);
            const room = rows[0];

            if (!room) {
                throw new Api404Error(`Room with id: ${id} not found`);
            }

            await connection.execute<OkPacket>(`UPDATE ${TABLE_NAME.ROOM} SET email = ? WHERE id = ?`, [email, id]);
            const [updatedRows] = await connection.query<IRoom[]>(`SELECT * FROM ${TABLE_NAME.ROOM} WHERE id = ?`, [id]);


            if (updatedRows.length) {
                return updatedRows[0];
            }
            const updatedRoom = updatedRows[0];
            return updatedRoom;
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async delete(id: string): Promise<void> {
        const connection = await getConnection();

        try {
            const [rows] = await connection.query<IRoom[]>(`SELECT * FROM ${TABLE_NAME.ROOM} WHERE id = ?`, [id]);
            const room = rows[0];

            if (!room) {
                throw new Api404Error(`Room with id: ${id} not found`);
            }

            await connection.execute<OkPacket>(`DELETE FROM ${TABLE_NAME.ROOM} WHERE id = ?`, [id]);
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async saveYDocByCode(code: string, yDoc: string): Promise<IRoom> {
        const connection = await getConnection();

        try {
            const [rows] = await connection.query<IRoom[]>(`SELECT * FROM ${TABLE_NAME.ROOM} WHERE code = ?`, [code]);
            const room = rows[0];

            if (!room) {
                throw new Api404Error(`Room with code: ${code} not found`);
            }

            await connection.execute<OkPacket>(`UPDATE ${TABLE_NAME.ROOM} SET ydoc = ? WHERE code = ?`, [yDoc, code]);

            const [updatedRows] = await connection.query<IRoom[]>(`SELECT * FROM ${TABLE_NAME.ROOM} WHERE code = ?`, [code]);

            if (updatedRows.length) {
                return updatedRows[0];
            }
            const updatedRoom = updatedRows[0];
            return updatedRoom;

        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }
}

export const Room = new RoomModel();
