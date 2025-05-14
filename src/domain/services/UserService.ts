import { hash, compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { User } from '../entities/User';
import { IUserService } from '../interfaces/iservices/IUserService';
import { IUserRepository } from '../interfaces/irepositories/IUserRepository';
import * as fs from 'fs';
import * as path from 'path';

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  private extractBase64String(base64Data: string): string {
    // Remove o prefixo "data:image/jpeg;base64," se existir
    if (base64Data.includes('base64,')) {
      return base64Data.split('base64,')[1];
    }
    return base64Data;
  }

  private async convertImageToBase64(imagePath: string): Promise<string> {
    try {
      // Normaliza o caminho do arquivo
      const normalizedPath = path.normalize(imagePath);
      
      // Lê o arquivo como buffer
      const imageBuffer = await fs.promises.readFile(normalizedPath);
      
      // Converte o buffer para base64
      return imageBuffer.toString('base64');
    } catch (error) {
      console.error('Erro ao converter imagem para base64:', error);
      throw new Error('Erro ao converter imagem para base64');
    }
  }

  private async processImageFile(imageFile: Express.Multer.File): Promise<string> {
    try {
      // Lê o arquivo como buffer
      const imageBuffer = await fs.promises.readFile(imageFile.path);
      
      // Converte o buffer para base64
      const base64String = imageBuffer.toString('base64');
      
      // Remove o arquivo temporário após a conversão
      await fs.promises.unlink(imageFile.path);
      
      return base64String;
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      throw new Error('Erro ao processar imagem');
    }
  }

  async findUserByName(name: string): Promise<User | null> {
    return this.userRepository.findByName(name.toLowerCase());
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email.toLowerCase());
  }

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    description?: string;
    imageFile?: Express.Multer.File;
  }): Promise<User> {
    // Converter nome e email para minúsculos
    const normalizedUserData = {
      ...userData,
      name: userData.name.toLowerCase(),
      email: userData.email.toLowerCase()
    };

    // Verificar se já existe usuário com o mesmo nome
    const existingUserByName = await this.userRepository.findByName(normalizedUserData.name);
    if (existingUserByName) {
      throw new Error('Usuário já está cadastrado');
    }

    // Verificar se já existe usuário com o mesmo email
    const existingUserByEmail = await this.userRepository.findByEmail(normalizedUserData.email);
    if (existingUserByEmail) {
      throw new Error('Usuário já está cadastrado');
    }

    const hashedPassword = await hash(normalizedUserData.password, 8);
    
    // Processar imagem se existir
    let imageBase64 = undefined;
    if (normalizedUserData.imageFile) {
      imageBase64 = await this.processImageFile(normalizedUserData.imageFile);
    }

    const user = await this.userRepository.create({
      name: normalizedUserData.name,
      email: normalizedUserData.email,
      password: hashedPassword,
      description: normalizedUserData.description,
      imageUrl: imageBase64
    } as User);

    return user;
  }

  async authenticateUser(email: string, password: string): Promise<{ user: User; token: string }> {
    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios');
    }

    // Converter email para minúsculos na autenticação também
    const normalizedEmail = email.toLowerCase();
    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new Error('Email não encontrado');
    }

    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) {
      throw new Error('Senha incorreta');
    }

    const secret = process.env.JWT_SECRET || 'default';
    const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

    const token = sign(
      { id: user.id },
      secret,
      { expiresIn }
    );

    // Remover a senha do objeto de resposta
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      description: user.description,
      imageUrl: user.imageUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return { user: userResponse as User, token };
  }

  async findUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async updateUser(id: string, userData: Partial<User> & { imageFile?: Express.Multer.File }): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    if (userData.email) {
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser && existingUser.id !== id) {
        throw new Error('Email already in use');
      }
    }

    if (userData.password) {
      userData.password = await hash(userData.password, 8);
    }

    // Processar imagem se existir
    if (userData.imageFile) {
      userData.imageUrl = await this.processImageFile(userData.imageFile);
    }

    // Remover imageFile do objeto antes de atualizar
    const { imageFile, ...userDataToUpdate } = userData;

    return this.userRepository.update(id, userDataToUpdate);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    await this.userRepository.delete(id);
  }

  async listUsers(): Promise<User[]> {
    const users = await this.userRepository.list();
    
    return users;
  }
} 