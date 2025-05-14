import { UserService } from '../../../src/domain/services/UserService';
import { IUserRepository } from '../../../src/domain/interfaces/irepositories/IUserRepository';
import { User } from '../../../src/domain/entities/User';
import { hash } from 'bcryptjs';

// Mock do repositório para testes unitários
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
      // Arrange: Configura os mocks para simular um usuário não existente
      mockUserRepository.findByName.mockResolvedValue(null);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({
        id: '1',
        ...mockUserData,
        password: await hash(mockUserData.password, 8),
        createdAt: new Date(),
        updatedAt: new Date()
      } as User);

      // Act: Tenta criar um novo usuário
      const result = await userService.createUser(mockUserData);

      // Assert: Verifica se o usuário foi criado corretamente
      expect(result).toBeDefined();
      expect(result.name).toBe(mockUserData.name.toLowerCase()); // Nome deve ser salvo em minúsculo
      expect(result.email).toBe(mockUserData.email.toLowerCase()); // Email deve ser salvo em minúsculo
      expect(mockUserRepository.create).toHaveBeenCalledTimes(1); // Deve chamar o método create uma vez
    });

    it('deve lançar erro se usuário já existir com mesmo nome', async () => {
      // Arrange: Configura o mock para simular um usuário existente com o mesmo nome
      mockUserRepository.findByName.mockResolvedValue({
        id: '1',
        ...mockUserData
      } as User);

      // Act & Assert: Tenta criar usuário e verifica se lança o erro esperado
      await expect(userService.createUser(mockUserData))
        .rejects
        .toThrow('Usuário já está cadastrado');
    });

    it('deve lançar erro se usuário já existir com mesmo email', async () => {
      // Arrange: Configura os mocks para simular um usuário existente com o mesmo email
      mockUserRepository.findByName.mockResolvedValue(null);
      mockUserRepository.findByEmail.mockResolvedValue({
        id: '1',
        ...mockUserData
      } as User);

      // Act & Assert: Tenta criar usuário e verifica se lança o erro esperado
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
      // Arrange: Configura o mock para simular um usuário existente com senha hasheada
      const hashedPassword = await hash(mockCredentials.password, 8);
      mockUserRepository.findByEmail.mockResolvedValue({
        id: '1',
        name: 'testuser',
        email: mockCredentials.email,
        password: hashedPassword
      } as User);

      // Act: Tenta autenticar o usuário
      const result = await userService.authenticateUser(
        mockCredentials.email,
        mockCredentials.password
      );

      // Assert: Verifica se a autenticação foi bem-sucedida
      expect(result).toHaveProperty('token'); // Deve retornar um token JWT
      expect(result.user).toBeDefined(); // Deve retornar os dados do usuário
      expect(result.user.email).toBe(mockCredentials.email); // Email deve corresponder
      expect(result.user.password).toBeUndefined(); // Senha não deve estar na resposta
    });

    it('deve lançar erro se email não for encontrado', async () => {
      // Arrange: Configura o mock para simular email não encontrado
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert: Tenta autenticar e verifica se lança o erro esperado
      await expect(userService.authenticateUser(
        mockCredentials.email,
        mockCredentials.password
      )).rejects.toThrow('Email não encontrado');
    });
  });

  describe('findUserById', () => {
    it('deve retornar usuário quando encontrado', async () => {
      // Arrange: Configura o mock para simular um usuário existente
      const mockUser = {
        id: '1',
        name: 'testuser',
        email: 'test@example.com'
      } as User;
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act: Busca o usuário pelo ID
      const result = await userService.findUserById('1');

      // Assert: Verifica se o usuário foi encontrado corretamente
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
    });

    it('deve retornar null quando usuário não for encontrado', async () => {
      // Arrange: Configura o mock para simular usuário não encontrado
      mockUserRepository.findById.mockResolvedValue(null);

      // Act: Busca um usuário inexistente
      const result = await userService.findUserById('1');

      // Assert: Verifica se retorna null
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
      // Arrange: Configura os mocks para simular usuário existente
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue({
        ...mockUser,
        name: 'updateduser'
      } as User);

      // Act: Atualiza o nome do usuário
      const result = await userService.updateUser(mockUserId, { name: 'updateduser' });

      // Assert: Verifica se a atualização foi bem-sucedida
      expect(result.name).toBe('updateduser');
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUserId, { name: 'updateduser' });
    });

    it('deve lançar erro se usuário não for encontrado', async () => {
      // Arrange: Configura o mock para simular usuário não encontrado
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert: Tenta atualizar e verifica se lança o erro esperado
      await expect(userService.updateUser(mockUserId, { name: 'updateduser' }))
        .rejects
        .toThrow('User not found');
    });

    it('deve lançar erro se email já estiver em uso', async () => {
      // Arrange: Configura os mocks para simular conflito de email
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.findByEmail.mockResolvedValue({
        id: '2',
        email: 'existing@example.com'
      } as User);

      // Act & Assert: Tenta atualizar email e verifica se lança o erro esperado
      await expect(userService.updateUser(mockUserId, { email: 'existing@example.com' }))
        .rejects
        .toThrow('Email already in use');
    });

    it('deve atualizar senha com hash', async () => {
      // Arrange: Configura os mocks para simular atualização de senha
      mockUserRepository.findById.mockResolvedValue(mockUser);
      const newPassword = 'newPassword123';
      mockUserRepository.update.mockResolvedValue({
        ...mockUser,
        password: await hash(newPassword, 8)
      } as User);

      // Act: Atualiza a senha do usuário
      const result = await userService.updateUser(mockUserId, { password: newPassword });

      // Assert: Verifica se a senha foi atualizada e criptografada
      expect(result.password).not.toBe(newPassword); // Senha deve estar criptografada
      expect(mockUserRepository.update).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    const mockUserId = '1';

    it('deve deletar usuário com sucesso', async () => {
      // Arrange: Configura o mock para simular usuário existente
      mockUserRepository.findById.mockResolvedValue({ id: mockUserId } as User);
      mockUserRepository.delete.mockResolvedValue();

      // Act: Deleta o usuário
      await userService.deleteUser(mockUserId);

      // Assert: Verifica se o método delete foi chamado corretamente
      expect(mockUserRepository.delete).toHaveBeenCalledWith(mockUserId);
    });

    it('deve lançar erro se usuário não for encontrado', async () => {
      // Arrange: Configura o mock para simular usuário não encontrado
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert: Tenta deletar e verifica se lança o erro esperado
      await expect(userService.deleteUser(mockUserId))
        .rejects
        .toThrow('User not found');
    });
  });

  describe('listUsers', () => {
    it('deve retornar lista de usuários', async () => {
      // Arrange: Configura o mock para simular lista de usuários
      const mockUsers = [
        { id: '1', name: 'user1', email: 'user1@example.com' },
        { id: '2', name: 'user2', email: 'user2@example.com' }
      ] as User[];
      mockUserRepository.list.mockResolvedValue(mockUsers);

      // Act: Lista todos os usuários
      const result = await userService.listUsers();

      // Assert: Verifica se a listagem está correta
      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.list).toHaveBeenCalled();
    });

    it('deve retornar lista vazia quando não houver usuários', async () => {
      // Arrange: Configura o mock para simular lista vazia
      mockUserRepository.list.mockResolvedValue([]);

      // Act: Lista usuários com banco vazio
      const result = await userService.listUsers();

      // Assert: Verifica se retorna lista vazia
      expect(result).toEqual([]);
    });
  });

  describe('findUserByName', () => {
    it('deve encontrar usuário pelo nome', async () => {
      // Arrange: Configura o mock para simular usuário encontrado
      const mockUser = {
        id: '1',
        name: 'testuser',
        email: 'test@example.com'
      } as User;
      mockUserRepository.findByName.mockResolvedValue(mockUser);

      // Act: Busca usuário pelo nome
      const result = await userService.findUserByName('testuser');

      // Assert: Verifica se o usuário foi encontrado corretamente
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findByName).toHaveBeenCalledWith('testuser');
    });

    it('deve retornar null quando usuário não for encontrado', async () => {
      // Arrange: Configura o mock para simular usuário não encontrado
      mockUserRepository.findByName.mockResolvedValue(null);

      // Act: Busca usuário inexistente
      const result = await userService.findUserByName('nonexistent');

      // Assert: Verifica se retorna null
      expect(result).toBeNull();
    });

    it('deve converter nome para minúsculo', async () => {
      // Arrange: Configura o mock para simular usuário encontrado
      const mockUser = {
        id: '1',
        name: 'testuser',
        email: 'test@example.com'
      } as User;
      mockUserRepository.findByName.mockResolvedValue(mockUser);

      // Act: Busca usuário com nome em maiúsculo
      await userService.findUserByName('TESTUSER');

      // Assert: Verifica se a busca foi feita com nome em minúsculo
      expect(mockUserRepository.findByName).toHaveBeenCalledWith('testuser');
    });
  });

  describe('findUserByEmail', () => {
    it('deve encontrar usuário pelo email', async () => {
      // Arrange: Configura o mock para simular usuário encontrado
      const mockUser = {
        id: '1',
        name: 'testuser',
        email: 'test@example.com'
      } as User;
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      // Act: Busca usuário pelo email
      const result = await userService.findUserByEmail('test@example.com');

      // Assert: Verifica se o usuário foi encontrado corretamente
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('deve retornar null quando usuário não for encontrado', async () => {
      // Arrange: Configura o mock para simular usuário não encontrado
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act: Busca usuário com email inexistente
      const result = await userService.findUserByEmail('nonexistent@example.com');

      // Assert: Verifica se retorna null
      expect(result).toBeNull();
    });

    it('deve converter email para minúsculo', async () => {
      // Arrange: Configura o mock para simular usuário encontrado
      const mockUser = {
        id: '1',
        name: 'testuser',
        email: 'test@example.com'
      } as User;
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      // Act: Busca usuário com email em maiúsculo
      await userService.findUserByEmail('TEST@EXAMPLE.COM');

      // Assert: Verifica se a busca foi feita com email em minúsculo
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });
  });
}); 