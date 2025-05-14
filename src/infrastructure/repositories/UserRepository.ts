import { Repository, DataSource } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/interfaces/irepositories/IUserRepository';
import { ObjectId } from 'mongodb';

export class UserRepository implements IUserRepository {
  private repository: Repository<User>;

  // Permite injetar um DataSource específico para testes, mantendo o AppDataSource como padrão para produção
  constructor(dataSource: DataSource = AppDataSource) {
    this.repository = dataSource.getRepository(User);
  }

  async create(user: User): Promise<User> {
    const newUser = this.repository.create(user);
    return this.repository.save(newUser);
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
    return this.repository.findOne({ where: { email: email.toLowerCase() } });
  }

  async findByName(name: string): Promise<User | null> {
    return this.repository.findOne({ where: { name } });
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    try {
      // Tenta atualizar pelo _id primeiro (MongoDB ObjectId)
      const objectId = new ObjectId(id);
      await this.repository.update({ _id: objectId }, userData);
      const updatedUser = await this.findById(id);
      if (updatedUser) {
        return updatedUser;
      }
    } catch (error) {
      // Se falhar com ObjectId, tenta com id normal
    }

    // Se não atualizou pelo _id, tenta pelo id (UUID)
    await this.repository.update({ id }, userData);
    const updatedUser = await this.findById(id);
    if (!updatedUser) {
      throw new Error('User not found');
    }
    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    try {
      // Tenta deletar pelo _id primeiro (MongoDB ObjectId)
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
  }

  async list(): Promise<User[]> {
    const users = await this.repository.find();
    return users.map(user => ({
      id: user._id ? user._id.toString() : user.id,
      name: user.name,
      email: user.email,
      description: user.description,
      imageUrl: user.imageUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    })) as User[];
  }
} 