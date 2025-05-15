import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './infrastructure/database/data-source';
import { UserController } from './application/controllers/UserController';
import { CryptocurrencyController } from './application/controllers/CryptocurrencyController';
import multer from 'multer';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import { Request, Response } from 'express';
import fs from 'fs';

const app = express();
const userController = new UserController();
const cryptocurrencyController = new CryptocurrencyController();

// Configuração do Multer para upload temporário de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    // Criar diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EricTech API',
      version: '1.0.0',
      description: 'API para gerenciamento de usuários e criptomoedas',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./src/application/controllers/*.ts'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rotas de Usuário
app.post('/users', upload.single('image'), userController.create.bind(userController));
app.post('/users/authenticate', userController.authenticate.bind(userController));
app.get('/users', userController.list.bind(userController));
app.put('/users/:id', upload.single('image'), userController.update.bind(userController));
app.delete('/users/:id', userController.delete.bind(userController));

// Rotas de Criptomoedas
app.get('/cryptocurrencies', cryptocurrencyController.list.bind(cryptocurrencyController));
app.get('/cryptocurrencies/name/:name', cryptocurrencyController.findByName.bind(cryptocurrencyController));
app.get('/cryptocurrencies/:id', cryptocurrencyController.findById.bind(cryptocurrencyController));

// Inicialização do servidor
const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error during Data Source initialization:', error);
  }); 