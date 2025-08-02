import { UserRepository } from "../repositories/user.repository";
import { User } from "../models/user.model";

export class UserController {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    async init(max: number): Promise<User[]> {
        try {
            console.info("[UserController] :: initialisation");
            let users = await this.fetchAllUsers(max);
            if (users.length == 0) {
                console.info("[UserController] :: fetchUsersData 🌐");
                users = await this.userRepository.fetchUsersData(max);

                //not necessary just to confirm data conformity
                users = await this.fetchAllUsers(max);
            } else {
                console.info("[UserController] :: fetchUsersDB 💾");
            }
            return users;
        } catch (e) {
            console.error("[UserController][init] :: Error initialising users data:", e);
            throw e;
        }
    }

    async fetchAllUsers(limit?: number): Promise<User[]> {
        try {
            return await this.userRepository.fetchAll(undefined, limit);
        } catch (error) {
            console.error("[UserController][fetchAllUsers] :: Error fetching users:", error);
            throw error;
        }
    }

    async updateUser(where: string, fields: Record<string, any>): Promise<any> {
        try {
            await this.userRepository.update(where, fields);
        } catch (error) {
            console.error("[UserController][updateUser] :: Error updating user:", error);
            throw error;
        }
    }

    async insertUsers(users: User[]): Promise<any> {
        try {
            await this.userRepository.insertMany(users);
        } catch (error) {
            console.error("[UserController][insertUsers] :: Error inserting users:", error);
            throw error;
        }
    }
}