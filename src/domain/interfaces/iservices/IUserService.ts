import { User } from "../../entities/User";

export interface IUserService {
  createUser(userData: {
    name: string;
    email: string;
    password: string;
    description?: string;
    imageBase64?: string;
  }): Promise<User>;
  
  authenticateUser(email: string, password: string): Promise<{ user: User; token: string }>;
  
  findUserById(id: string): Promise<User | null>;
  
  findUserByEmail(email: string): Promise<User | null>;
  
  updateUser(id: string, userData: Partial<User> & { imageBase64?: string }): Promise<User>;
  
  deleteUser(id: string): Promise<void>;
  
  listUsers(): Promise<User[]>;
} 