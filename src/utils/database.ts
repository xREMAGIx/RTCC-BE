import { createPool, Pool } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool: Pool = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PWD,
    port: process.env.DB_PORT as unknown as number
});

export const getConnection = async () => {
    try {
        const connection = await pool.getConnection();
        return connection;
    } catch (error) {
        console.log(error);
        throw error;
    }
};


