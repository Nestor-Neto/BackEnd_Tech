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
    imageBase64?: string;
  }): Promise<User> {
    // Converter nome e email para minúsculos
    const normalizedUserData = {
      ...userData,
      name: userData.name.toLowerCase(),
      email: userData.email.toLowerCase()
    };

    // Verificar se já existe usuário com o mesmo email
    const existingUserByEmail = await this.userRepository.findByEmail(normalizedUserData.email);
    if (existingUserByEmail) {
      throw new Error('Usuário já está cadastrado');
    }

    const hashedPassword = await hash(normalizedUserData.password, 8);
    
    const user = await this.userRepository.create({
      name: normalizedUserData.name,
      email: normalizedUserData.email,
      password: hashedPassword,
      description: normalizedUserData.description,
      imageUrl: userData.imageBase64
    } as User);

    
    return {
      id: user._id ? user._id.toString() : user.id,
      name: user.name,
      email: user.email,
      description: user.description,
      imageUrl: user.imageUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    } as User;
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
      throw new Error('Invalid credentials');
    }

    const secret = process.env.JWT_SECRET || 'default';
    const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

    // Converter o ObjectId para string
    const userId = user._id ? user._id.toString() : user.id;

    const token = sign(
      { id: userId },
      secret,
      { expiresIn }
    );

    // Remover a senha do objeto de resposta e garantir que o ID seja incluído como string
    const userResponse = {
      id: userId, // Usando o ID convertido para string
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

  async updateUser(id: string, userData: Partial<User> & { imageBase64?: string }): Promise<User> {
    console.log('Atualizando userService: ', { id, userData });

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado!');
    }

    // Converter nome para minúsculos
    if (userData.name) {
      userData.name = userData.name.toLowerCase();
    }
    // Processar imagem base64 se existir
    if (userData.imageBase64) {
      userData.imageUrl = userData.imageBase64;
    } else {
      // Se não houver nova imagem, manter a imagem atual
      const existingUser = await this.userRepository.findById(id);
      if (existingUser) {
        userData.imageUrl = existingUser.imageUrl;
      }
    }

    // Remover imageBase64 do objeto antes de atualizar
    const { imageBase64, ...userDataToUpdate } = userData;

    return this.userRepository.update(id, userDataToUpdate);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('usuário não encontrado!');
    }

    await this.userRepository.delete(id);
  }

  async listUsers(): Promise<User[]> {
    const users = await this.userRepository.list();
    
    return users;
  }
} 