import { DataSource } from 'typeorm';
import { User } from '../../domain/entities/User';
import { Cryptocurrency } from '../../domain/entities/Cryptocurrency';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mongodb',
  url: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.5.0',
  database: 'erictech',
  entities: [User, Cryptocurrency],
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
});

// Inicializar a conexão
AppDataSource.initialize()
  .then(() => {
    console.log('Conexão com o banco de dados estabelecida com sucesso');
  })
  .catch((error) => {
    console.error('Erro ao conectar com o banco de dados:', error);
    process.exit(1); // Encerra a aplicação em caso de erro na conexão
  }); 