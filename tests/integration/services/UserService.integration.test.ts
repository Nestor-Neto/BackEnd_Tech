import { UserService } from '../../../src/domain/services/UserService';
import { UserRepository } from '../../../src/infrastructure/repositories/UserRepository';
import { User } from '../../../src/domain/entities/User';
import { hash } from 'bcryptjs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { DataSource } from 'typeorm';
import { ObjectId } from 'mongodb';

describe('UserService Integration Tests', () => {
  let mongoServer: MongoMemoryServer;
  let dataSource: DataSource;
  let userRepository: UserRepository;
  let userService: UserService;

  beforeAll(async () => {
    // Inicializa o servidor MongoDB em memória
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Configura o TypeORM com o MongoDB em memória
    dataSource = new DataSource({
      type: 'mongodb',
      url: mongoUri,
      entities: [User],
      synchronize: true,
    });

    await dataSource.initialize();

    // Inicializa os serviços usando o dataSource de teste para garantir isolamento do banco de dados
    userRepository = new UserRepository(dataSource);
    userService = new UserService(userRepository);
  });

  afterAll(async () => {
    // Limpa e fecha as conexões
    await dataSource.destroy();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Limpa a coleção de usuários antes de cada teste
    const userRepo = dataSource.getMongoRepository(User);
    await userRepo.deleteMany({});
  });

  describe('createUser', () => {
    it('deve criar um usuário com sucesso', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        description: 'Test description',
        imageUrl: 'https://example.com/image.jpg'
      };

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(userData.name.toLowerCase());
      expect(result.email).toBe(userData.email.toLowerCase());
      expect(result.description).toBe(userData.description);
      expect(result.imageUrl).toBeNull(); // imageUrl deve ser null quando não há arquivo de imagem
      expect(result.password).not.toBe(userData.password); // Senha deve estar hasheada
    });

    it('deve lançar erro ao tentar criar usuário com email duplicado', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        description: 'Test description',
        imageUrl: 'https://example.com/image.jpg'
      };

      // Act
      await userService.createUser(userData);

      // Assert
      await expect(userService.createUser(userData)).rejects.toThrow('Usuário já está cadastrado');
    });
  });

  describe('authenticateUser', () => {
    it('deve autenticar usuário com sucesso', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        description: 'Test description',
        imageUrl: 'https://example.com/image.jpg'
      };
      const createdUser = await userService.createUser(userData);

      // Act
      const result = await userService.authenticateUser(userData.email, userData.password);

      // Assert
      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(userData.email.toLowerCase());
    });

    it('deve falhar ao autenticar com senha incorreta', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        description: 'Test description',
        imageUrl: 'https://example.com/image.jpg'
      };
      await userService.createUser(userData);

      // Act & Assert
      await expect(userService.authenticateUser(userData.email, 'wrongpassword')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('updateUser', () => {
    it('deve atualizar nome do usuário com sucesso', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        description: 'Test description',
        imageUrl: 'https://example.com/image.jpg'
      };
      const createdUser = await userService.createUser(userData);

      // Act
      const updatedUser = await userService.updateUser(createdUser._id.toString(), {
        name: 'Updated Name'
      });

      // Assert
      expect(updatedUser.name).toBe('Updated Name');
      expect(updatedUser.email).toBe(userData.email.toLowerCase());
    });

    it('deve atualizar senha do usuário com sucesso', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        description: 'Test description',
        imageUrl: 'https://example.com/image.jpg'
      };
      const createdUser = await userService.createUser(userData);

      // Act
      const updatedUser = await userService.updateUser(createdUser._id.toString(), {
        password: 'newpassword123'
      });

      // Assert
      expect(updatedUser.password).not.toBe('newpassword123'); // Senha deve estar hasheada
    });
  });

  describe('deleteUser', () => {
    it('deve deletar usuário com sucesso', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        description: 'Test description',
        imageUrl: 'https://example.com/image.jpg'
      };
      const createdUser = await userService.createUser(userData);

      // Act
      await userService.deleteUser(createdUser._id.toString());

      // Assert
      const deletedUser = await userService.findUserById(createdUser._id.toString());
      expect(deletedUser).toBeNull();
    });
  });

  describe('listUsers', () => {
    it('deve listar todos os usuários', async () => {
      // Arrange
      const users = [
        {
          name: 'User 1',
          email: 'user1@example.com',
          password: 'password123',
          description: 'Description 1',
          imageUrl: 'https://example.com/image1.jpg'
        },
        {
          name: 'User 2',
          email: 'user2@example.com',
          password: 'password123',
          description: 'Description 2',
          imageUrl: 'https://example.com/image2.jpg'
        }
      ];

      for (const userData of users) {
        await userService.createUser(userData);
      }

      // Act
      const result = await userService.listUsers();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].email).toBe(users[0].email.toLowerCase());
      expect(result[1].email).toBe(users[1].email.toLowerCase());
    });
  });

  describe('findUserByName', () => {
    it('deve encontrar usuário pelo nome', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        description: 'Test description',
        imageUrl: 'https://example.com/image.jpg'
      };
      await userService.createUser(userData);

      // Act
      const result = await userService.findUserByName(userData.name);

      // Assert
      expect(result).toBeDefined();
      expect(result?.name).toBe(userData.name.toLowerCase());
      expect(result?.email).toBe(userData.email.toLowerCase());
    });

    it('deve retornar null para nome não encontrado', async () => {
      // Act
      const result = await userService.findUserByName('NonExistentUser');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findUserByEmail', () => {
    it('deve encontrar usuário pelo email', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        description: 'Test description',
        imageUrl: 'https://example.com/image.jpg'
      };
      await userService.createUser(userData);

      // Act
      const result = await userService.findUserByEmail(userData.email);

      // Assert
      expect(result).toBeDefined();
      expect(result?.email).toBe(userData.email.toLowerCase());
      expect(result?.name).toBe(userData.name.toLowerCase());
    });

    it('deve retornar null para email não encontrado', async () => {
      // Act
      const result = await userService.findUserByEmail('nonexistent@example.com');

      // Assert
      expect(result).toBeNull();
    });
  });
}); 