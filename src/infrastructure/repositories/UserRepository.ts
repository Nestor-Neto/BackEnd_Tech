import { Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/interfaces/irepositories/IUserRepository';
import { ObjectId } from 'mongodb';

export class UserRepository implements IUserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  async create(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    try {
      // Tenta encontrar pelo _id primeiro (MongoDB ObjectId)
      const objectId = new ObjectId(id);
      const userByObjectId = await this.repository.findOne({ where: { _id: objectId } });
      if (userByObjectId) {
        return userByObjectId;
      }
    } catch (error) {
      // Se o ID não for um ObjectId válido, continua para a busca por UUID
    }
    
    // Se não encontrar pelo _id, tenta pelo id (UUID)
    return this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findByName(name: string): Promise<User | null> {
    return this.repository.findOne({ where: { name } });
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.repository.update(id, userData);
    const updatedUser = await this.findById(id);
    if (!updatedUser) {
      throw new Error('User not found');
    }
    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    try {
      // Primeiro verifica se o usuário existe
      const user = await this.findById(id);
      if (!user) {
        throw new Error('User not found');
      }

      // Tenta deletar pelo _id primeiro (MongoDB ObjectId)
      try {
        const objectId = new ObjectId(id);
        const result = await this.repository.delete({ _id: objectId });
        if (result.affected === 0) {
          // Se não deletou pelo _id, tenta pelo id (UUID)
          const resultById = await this.repository.delete({ id });
          if (resultById.affected === 0) {
            throw new Error('Failed to delete user');
          }
        }
      } catch (error) {
        // Se falhar ao tentar com ObjectId, tenta com id normal
        const result = await this.repository.delete({ id });
        if (result.affected === 0) {
          throw new Error('Failed to delete user');
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        throw error;
      }
      throw new Error('Error deleting user');
    }
  }

  async list(): Promise<User[]> {
    console.log('Método list() foi chamado!');
    const users = await this.repository.find();
    
    console.log(users);
    return users.map(user => ({
      id: (user as any)._id ? (user as any)._id.toString() : (user as any).id,
      name: user.name,
      email: user.email,
      description: user.description,
      imageUrl: user.imageUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    })) as User[];
  }
} 