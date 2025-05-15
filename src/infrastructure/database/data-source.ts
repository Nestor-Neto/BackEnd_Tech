import { DataSource } from 'typeorm';
import { User } from '../../domain/entities/User';
import { Cryptocurrency } from '../../domain/entities/Cryptocurrency';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';
const databaseName = isTest ? 'testerictech' : 'erictech';

export const AppDataSource = new DataSource({
  type: 'mongodb',
  url: isTest ? process.env.MONGODB_URI_TEST : process.env.MONGODB_URI,
  database: databaseName,
  entities: [User, Cryptocurrency],
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
});

// Função para inicializar a conexão
export async function initializeDatabase() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log(`Conexão com o banco de dados ${databaseName} estabelecida com sucesso`);
    }
  } catch (error) {
    console.error('Erro ao conectar com o banco de dados:', error);
    throw error;
  }
}

// Função para limpar o banco de dados (útil para testes)
export async function cleanDatabase() {
  if (!AppDataSource.isInitialized) {
    await initializeDatabase();
  }

  try {
    // Obtém a URL de conexão do DataSource
    const mongoUrl = isTest ? process.env.MONGODB_URI_TEST : process.env.MONGODB_URI;
    if (!mongoUrl) {
      throw new Error('URL do MongoDB não configurada');
    }

    // Conecta diretamente ao MongoDB
    const client = new MongoClient(mongoUrl);
    await client.connect();

    // Obtém o banco de dados
    const db = client.db(databaseName);

    // Obtém todas as coleções
    const collections = await db.collections();

    // Limpa cada coleção
    for (const collection of collections) {
      await collection.deleteMany({});
    }

    // Fecha a conexão
    await client.close();
  } catch (error) {
    console.error('Erro ao limpar o banco de dados:', error);
    throw error;
  }
}

// Função para fechar a conexão
export async function closeDatabase() {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
} 