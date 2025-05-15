import { UserService } from '../../../src/domain/services/UserService';
import { UserRepository } from '../../../src/infrastructure/repositories/UserRepository';
import { initializeDatabase, cleanDatabase, closeDatabase } from '../../../src/infrastructure/database/data-source';

describe('UserService E2E', () => {
  let userService: UserService;
  let userRepository: UserRepository;

  beforeAll(async () => {
    // Configura o ambiente de teste
    process.env.NODE_ENV = 'test';
    
    // Inicializa a conexão com o banco de dados de teste
    await initializeDatabase();
    
    // Inicializa os serviços necessários
    userRepository = new UserRepository();
    userService = new UserService(userRepository);
  });

  afterAll(async () => {
    // Limpa o banco de dados e fecha a conexão após todos os testes
    await cleanDatabase();
    await closeDatabase();
  });

  beforeEach(async () => {
    // Garante que cada teste começa com um banco de dados limpo
    await cleanDatabase();
  });

  describe('createUser', () => {
    const mockUserData = {
      name: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    it('deve criar um novo usuário com sucesso', async () => {
      // Act: Cria um novo usuário
      const result = await userService.createUser(mockUserData);

      // Assert: Verifica se o usuário foi criado corretamente
      expect(result).toBeDefined();
      expect(result.name).toBe(mockUserData.name.toLowerCase()); // Nome deve ser salvo em minúsculo
      expect(result.email).toBe(mockUserData.email.toLowerCase()); // Email deve ser salvo em minúsculo
      expect(result.password).not.toBe(mockUserData.password); // Verifica se a senha foi criptografada
    });

    it('deve lançar erro ao tentar criar usuário com email duplicado', async () => {
      // Arrange: Cria um usuário inicial
      await userService.createUser(mockUserData);

      // Act & Assert: Tenta criar outro usuário com o mesmo email
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

    beforeEach(async () => {
      // Prepara o banco com um usuário para autenticação
      await userService.createUser({
        name: 'testuser',
        email: mockCredentials.email,
        password: mockCredentials.password
      });
    });

    it('deve autenticar usuário com sucesso', async () => {
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

    it('deve falhar ao autenticar com senha incorreta', async () => {
      // Act & Assert: Tenta autenticar com senha errada
      await expect(userService.authenticateUser(
        mockCredentials.email,
        'senha_incorreta'
      )).rejects.toThrow('Senha incorreta');
    });
  });

  describe('updateUser', () => {
    let userId: string;

    beforeEach(async () => {
      // Prepara o banco com um usuário para atualização
      const user = await userService.createUser({
        name: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      userId = user.id;
    });

    it('deve atualizar nome do usuário com sucesso', async () => {
      // Act: Atualiza o nome do usuário
      const result = await userService.updateUser(userId, { name: 'updateduser' });

      // Assert: Verifica se o nome foi atualizado
      expect(result.name).toBe('updateduser');
    });

    it('deve atualizar senha com sucesso', async () => {
      // Arrange: Define nova senha
      const newPassword = 'newPassword123';

      // Act: Atualiza a senha do usuário
      const result = await userService.updateUser(userId, { password: newPassword });

      // Assert: Verifica se a senha foi atualizada e criptografada
      expect(result.password).not.toBe(newPassword);
      
      // Verifica se a nova senha funciona na autenticação
      const authResult = await userService.authenticateUser('test@example.com', newPassword);
      expect(authResult).toHaveProperty('token');
    });
  });

  describe('deleteUser', () => {
    let userId: string;

    beforeEach(async () => {
      // Prepara o banco com um usuário para deleção
      const user = await userService.createUser({
        name: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      userId = user.id;
    });

    it('deve deletar usuário com sucesso', async () => {
      // Act: Deleta o usuário
      await userService.deleteUser(userId);

      // Assert: Verifica se o usuário foi realmente deletado
      const deletedUser = await userService.findUserById(userId);
      expect(deletedUser).toBeNull();
    });
  });

  describe('listUsers', () => {
    beforeEach(async () => {
      // Prepara o banco com dois usuários para listagem
      await userService.createUser({
        name: 'user1',
        email: 'user1@example.com',
        password: 'password123'
      });
      await userService.createUser({
        name: 'user2',
        email: 'user2@example.com',
        password: 'password123'
      });
    });

    it('deve listar todos os usuários', async () => {
      // Act: Lista todos os usuários
      const users = await userService.listUsers();

      // Assert: Verifica se a listagem está correta
      expect(users).toHaveLength(2); // Deve ter exatamente 2 usuários
      expect(users[0].email).toBe('user1@example.com'); // Primeiro usuário
      expect(users[1].email).toBe('user2@example.com'); // Segundo usuário
    });
  });
}); 