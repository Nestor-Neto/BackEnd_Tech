import { UserService } from '../../../src/domain/services/UserService';
import { IUserRepository } from '../../../src/domain/interfaces/irepositories/IUserRepository';
import { User } from '../../../src/domain/entities/User';
import { hash } from 'bcryptjs';

// Mock do repositório
const mockUserRepository: jest.Mocked<IUserRepository> = {
  findByName: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  list: jest.fn()
};

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
    userService = new UserService(mockUserRepository);
  });

  describe('createUser', () => {
    const mockUserData = {
      name: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    it('deve criar um novo usuário com sucesso', async () => {
      // Arrange
      mockUserRepository.findByName.mockResolvedValue(null);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({
        id: '1',
        ...mockUserData,
        password: await hash(mockUserData.password, 8),
        createdAt: new Date(),
        updatedAt: new Date()
      } as User);

      // Act
      const result = await userService.createUser(mockUserData);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(mockUserData.name.toLowerCase());
      expect(result.email).toBe(mockUserData.email.toLowerCase());
      expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro se usuário já existir com mesmo nome', async () => {
      // Arrange
      mockUserRepository.findByName.mockResolvedValue({
        id: '1',
        ...mockUserData
      } as User);

      // Act & Assert
      await expect(userService.createUser(mockUserData))
        .rejects
        .toThrow('Usuário já está cadastrado');
    });

    it('deve lançar erro se usuário já existir com mesmo email', async () => {
      // Arrange
      mockUserRepository.findByName.mockResolvedValue(null);
      mockUserRepository.findByEmail.mockResolvedValue({
        id: '1',
        ...mockUserData
      } as User);

      // Act & Assert
      await expect(userService.createUser(mockUserData))
        .rejects
        .toThrow('Usuário já está cadastrado');
    });
  });

  describe('authenticateUser', () => {
    const mockCredentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('deve autenticar usuário com sucesso', async () => {
      // Arrange
      const hashedPassword = await hash(mockCredentials.password, 8);
      mockUserRepository.findByEmail.mockResolvedValue({
        id: '1',
        name: 'testuser',
        email: mockCredentials.email,
        password: hashedPassword
      } as User);

      // Act
      const result = await userService.authenticateUser(
        mockCredentials.email,
        mockCredentials.password
      );

      // Assert
      expect(result).toHaveProperty('token');
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(mockCredentials.email);
      expect(result.user.password).toBeUndefined(); // Senha não deve estar na resposta
    });

    it('deve lançar erro se email não for encontrado', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.authenticateUser(
        mockCredentials.email,
        mockCredentials.password
      )).rejects.toThrow('Email não encontrado');
    });
  });

  describe('findUserById', () => {
    it('deve retornar usuário quando encontrado', async () => {
      // Arrange
      const mockUser = {
        id: '1',
        name: 'testuser',
        email: 'test@example.com'
      } as User;
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await userService.findUserById('1');

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
    });

    it('deve retornar null quando usuário não for encontrado', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act
      const result = await userService.findUserById('1');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    const mockUserId = '1';
    const mockUser = {
      id: mockUserId,
      name: 'testuser',
      email: 'test@example.com',
      password: 'hashedPassword'
    } as User;

    it('deve atualizar usuário com sucesso', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue({
        ...mockUser,
        name: 'updateduser'
      } as User);

      // Act
      const result = await userService.updateUser(mockUserId, { name: 'updateduser' });

      // Assert
      expect(result.name).toBe('updateduser');
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUserId, { name: 'updateduser' });
    });

    it('deve lançar erro se usuário não for encontrado', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.updateUser(mockUserId, { name: 'updateduser' }))
        .rejects
        .toThrow('User not found');
    });

    it('deve lançar erro se email já estiver em uso', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.findByEmail.mockResolvedValue({
        id: '2',
        email: 'existing@example.com'
      } as User);

      // Act & Assert
      await expect(userService.updateUser(mockUserId, { email: 'existing@example.com' }))
        .rejects
        .toThrow('Email already in use');
    });

    it('deve atualizar senha com hash', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(mockUser);
      const newPassword = 'newPassword123';
      mockUserRepository.update.mockResolvedValue({
        ...mockUser,
        password: await hash(newPassword, 8)
      } as User);

      // Act
      const result = await userService.updateUser(mockUserId, { password: newPassword });

      // Assert
      expect(result.password).not.toBe(newPassword); // Senha deve estar hasheada
      expect(mockUserRepository.update).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    const mockUserId = '1';

    it('deve deletar usuário com sucesso', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue({ id: mockUserId } as User);
      mockUserRepository.delete.mockResolvedValue();

      // Act
      await userService.deleteUser(mockUserId);

      // Assert
      expect(mockUserRepository.delete).toHaveBeenCalledWith(mockUserId);
    });

    it('deve lançar erro se usuário não for encontrado', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.deleteUser(mockUserId))
        .rejects
        .toThrow('User not found');
    });
  });

  describe('listUsers', () => {
    it('deve retornar lista de usuários', async () => {
      // Arrange
      const mockUsers = [
        { id: '1', name: 'user1', email: 'user1@example.com' },
        { id: '2', name: 'user2', email: 'user2@example.com' }
      ] as User[];
      mockUserRepository.list.mockResolvedValue(mockUsers);

      // Act
      const result = await userService.listUsers();

      // Assert
      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.list).toHaveBeenCalled();
    });

    it('deve retornar lista vazia quando não houver usuários', async () => {
      // Arrange
      mockUserRepository.list.mockResolvedValue([]);

      // Act
      const result = await userService.listUsers();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findUserByName', () => {
    it('deve encontrar usuário pelo nome', async () => {
      // Arrange
      const mockUser = {
        id: '1',
        name: 'testuser',
        email: 'test@example.com'
      } as User;
      mockUserRepository.findByName.mockResolvedValue(mockUser);

      // Act
      const result = await userService.findUserByName('testuser');

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findByName).toHaveBeenCalledWith('testuser');
    });

    it('deve retornar null quando usuário não for encontrado', async () => {
      // Arrange
      mockUserRepository.findByName.mockResolvedValue(null);

      // Act
      const result = await userService.findUserByName('nonexistent');

      // Assert
      expect(result).toBeNull();
    });

    it('deve converter nome para minúsculo', async () => {
      // Arrange
      const mockUser = {
        id: '1',
        name: 'testuser',
        email: 'test@example.com'
      } as User;
      mockUserRepository.findByName.mockResolvedValue(mockUser);

      // Act
      await userService.findUserByName('TESTUSER');

      // Assert
      expect(mockUserRepository.findByName).toHaveBeenCalledWith('testuser');
    });
  });

  describe('findUserByEmail', () => {
    it('deve encontrar usuário pelo email', async () => {
      // Arrange
      const mockUser = {
        id: '1',
        name: 'testuser',
        email: 'test@example.com'
      } as User;
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      // Act
      const result = await userService.findUserByEmail('test@example.com');

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('deve retornar null quando usuário não for encontrado', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act
      const result = await userService.findUserByEmail('nonexistent@example.com');

      // Assert
      expect(result).toBeNull();
    });

    it('deve converter email para minúsculo', async () => {
      // Arrange
      const mockUser = {
        id: '1',
        name: 'testuser',
        email: 'test@example.com'
      } as User;
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      // Act
      await userService.findUserByEmail('TEST@EXAMPLE.COM');

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });
  });
}); 