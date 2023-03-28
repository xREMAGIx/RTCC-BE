import bcrypt from 'bcrypt';
import { Api404Error } from 'middleware/errorHandler';
import { OkPacket, RowDataPacket } from "mysql2";
import { getConnection } from 'utils/database';

const USER_TABLE_NAME = "User"

export interface IUser extends RowDataPacket {
    id: number;
    username: string;
    email: string;
    password: string;
}

export interface CreateUserParams {
    username: string;
    email: string;
    password: string;
}

class UserModel {
    async findByEmail(email: string): Promise<IUser | null> {
        const connection = await getConnection();
        const [rows] = await connection.query<IUser[]>(`SELECT * FROM ${USER_TABLE_NAME} WHERE email = ?`, [email]);
        connection.release();

        if (rows.length) {
            return rows[0];
        }
        return null;
    }

    async findByUsername(username: string): Promise<IUser | null> {
        const connection = await getConnection();
        const [rows] = await connection.query<IUser[]>(`SELECT * FROM ${USER_TABLE_NAME} WHERE username = ?`, [username]);
        connection.release();

        if (rows.length) {
            return rows[0];
        }
        return null;
    }

    async emailExist(email: string): Promise<boolean> {
        const connection = await getConnection();

        try {
            const [rows] = await connection.query<IUser[]>(`SELECT * FROM ${USER_TABLE_NAME} WHERE email = ?`, [email]);
            return rows.length > 0;
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async usernameExist(username: string): Promise<boolean> {
        const connection = await getConnection();

        try {
            const [rows] = await connection.query<IUser[]>(`SELECT * FROM ${USER_TABLE_NAME} WHERE username = ?`, [username]);
            return rows.length > 0;
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async create(params: CreateUserParams): Promise<IUser> {
        const connection = await getConnection();

        try {
            const { username, email, password } = params;
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const connection = await getConnection();
            const [result] = await connection.execute<OkPacket>(`INSERT INTO ${USER_TABLE_NAME} (username, email, password, type_id) VALUES (?, ?, ?, ?)`, [username, email, hashedPassword, 1]);
            const insertedId = result.insertId;

            const [rows] = await connection.query<IUser[]>(`SELECT * FROM ${USER_TABLE_NAME} WHERE id = ?`, [insertedId]);
            const user = rows[0];
            return user;

        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async verifyPassword(user: IUser, password: string): Promise<boolean> {
        return await bcrypt.compare(password, user.password);
    }

    async readAll() {
        try {
            const connection = await getConnection();
            console.log('312321');

            const [rows] = await connection.query<IUser[]>(`SELECT * FROM ${USER_TABLE_NAME}`);
            console.log('asdadad');

            connection.release();
            return rows;
        } catch (error) {
            throw error;
        }
    }

    async readById(id: string): Promise<IUser | null> {
        const connection = await getConnection();

        try {
            const [rows] = await connection.query<IUser[]>(`SELECT * FROM ${USER_TABLE_NAME} WHERE id = ?`, [id]);

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

    async update(userData: Omit<IUser, "password">): Promise<IUser | null> {
        const connection = await getConnection();
        try {
            const { id, email } = userData;
            const [rows] = await connection.query<IUser[]>(`SELECT * FROM ${USER_TABLE_NAME} WHERE id = ?`, [id]);
            const user = rows[0];

            if (!user) {
                throw new Api404Error(`User with id: ${id} not found`);
            }

            await connection.execute<OkPacket>(`UPDATE ${USER_TABLE_NAME} SET email = ? WHERE id = ?`, [email, id]);
            const [updatedRows] = await connection.query<IUser[]>(`SELECT * FROM ${USER_TABLE_NAME} WHERE id = ?`, [id]);


            if (updatedRows.length) {
                return updatedRows[0];
            }
            const updatedUser = updatedRows[0];
            return updatedUser;
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async delete(id: string): Promise<void> {
        const connection = await getConnection();

        try {
            const [rows] = await connection.query<IUser[]>(`SELECT * FROM ${USER_TABLE_NAME} WHERE id = ?`, [id]);
            const user = rows[0];

            if (!user) {
                throw new Api404Error(`User with id: ${id} not found`);
            }

            await connection.execute<OkPacket>(`DELETE FROM ${USER_TABLE_NAME} WHERE id = ?`, [id]);
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }
}

export const User = new UserModel();
