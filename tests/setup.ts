import dotenv from 'dotenv';
import { initializeDatabase, closeDatabase } from '../src/infrastructure/database/data-source';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Configurações globais para os testes
beforeAll(async () => {
  // Configurações que devem ser executadas antes de todos os testes
  process.env.NODE_ENV = 'test';
  
  // Inicializa a conexão com o banco de dados
  await initializeDatabase();
});

afterAll(async () => {
  // Limpeza após todos os testes
  await closeDatabase();
});

// Configurações para cada teste
beforeEach(() => {
  // Configurações que devem ser executadas antes de cada teste
});

afterEach(() => {
  // Limpeza após cada teste
}); 