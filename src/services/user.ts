import { generateToken } from "utils/jwt";
import { compare } from "bcrypt";
import { Api401Error, Api404Error, Api409Error, Api500Error } from "middleware/errorHandler";
import { CreateUserParams, IUser, User } from 'models/user';
export interface LoginUserParams {
    username: string;
    password: string;
}

export interface LoginUserData {
    user: IUser;
    token: string;
}

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
    async getUserById(userId: string): Promise<Partial<IUser>> {
        try {
            const user = await User.readById(userId);
            if (!user) {
                throw new Api404Error(`User with id: ${userId} not found`)
            }
            const resUser = { ...user } as Partial<IUser>;
            delete resUser.password;
            return resUser;
        } catch (error) {
            throw new Api500Error();
        }
    }

    // Create a new user
    async createUser(params: CreateUserParams): Promise<IUser> {
        const { username, email, password } = params;

        if (await User.emailExist(email)) {
            throw new Api409Error(`Email: ${email} already existed!`, 'validate', 'email');
        }

        if (await User.usernameExist(username)) {
            throw new Api409Error(`Username: ${email} already existed!`, 'validate', 'username');
        }

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

    // Login a user
    async loginUser(params: LoginUserParams): Promise<LoginUserData> {
        const { username, password } = params;

        // Check if user exists in database
        const user = await User.findByUsername(username);
        if (!user) {
            throw new Api401Error(`Invalid username or password`);
        }

        // Check if password is correct
        const passwordMatch = await compare(password, user.password);

        if (!passwordMatch) {
            throw new Api401Error(`Invalid username or password`);
        }

        // Create and return JWT
        const token = generateToken({ id: user.id, username: user.username });

        return { user, token };
    }
}
