import { Api404Error, Api500Error } from "middleware/errorHandler";
import { CreateUserParams, IUser, User } from 'models/user';

export class UserService {
    // Get all users
    async getAllUsers(): Promise<IUser[]> {
        try {
            const users = await User.readAll();
            return users;
        } catch (error) {
            throw new Api500Error();
        }
    }

    // Get a user by ID
    async getUserById(userId: string): Promise<IUser | null> {
        try {
            const user = await User.readById(userId);
            if (user === null) {
                throw new Api404Error(`User with id: ${userId} not found`)
            }
            return user;
        } catch (error) {
            throw new Api500Error();
        }
    }

    // Create a new user
    async createUser(params: CreateUserParams): Promise<IUser> {
        const { username, email, password } = params;

        const user = await User.create({ username, email, password });
        return user;
    }

    // Update an existing user
    async updateUser(userId: string, userData: Omit<IUser, "id" | "password">): Promise<IUser | null> {
        const newUser = await User.update({ id: userId, userData });
        return newUser;
    }

    // Delete a user
    async deleteUser(id: string): Promise<void> {
        await User.delete(id);
    }
}
