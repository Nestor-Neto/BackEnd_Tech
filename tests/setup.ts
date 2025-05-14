import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Configurações globais para os testes
beforeAll(() => {
  // Configurações que devem ser executadas antes de todos os testes
  process.env.NODE_ENV = 'test';
});

afterAll(() => {
  // Limpeza após todos os testes
});

// Configurações para cada teste
beforeEach(() => {
  // Configurações que devem ser executadas antes de cada teste
});

afterEach(() => {
  // Limpeza após cada teste
}); 