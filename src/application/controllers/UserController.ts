import { Request, Response } from 'express';
import { UserService } from '../../domain/services/UserService';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { User } from '../../domain/entities/User';
import fs from 'fs';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: ID único do usuário
 *         name:
 *           type: string
 *           description: Nome do usuário
 *         email:
 *           type: string
 *           description: Email do usuário
 *         password:
 *           type: string
 *           description: Senha do usuário
 *         description:
 *           type: string
 *           description: Descrição do usuário
 *         imageUrl:
 *           type: string
 *           description: URL da imagem do usuário
 */

export class UserController {
  private userService: UserService;

  constructor() {
    const userRepository = new UserRepository();
    this.userService = new UserService(userRepository);
  }

  async findUserByName(name: string): Promise<User | null> {
    return this.userService.findUserByName(name);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userService.findUserByEmail(email);
  }

  /**
   * @swagger
   * /users:
   *   post:
   *     summary: Criar um novo usuário
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - email
   *               - password
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *               description:
   *                 type: string
   *               image:
   *                 type: string
   *                 format: binary
   *     responses:
   *       201:
   *         description: Usuário criado com sucesso
   *       400:
   *         description: Usuário já existe
   *       500:
   *         description: Erro interno do servidor
   */
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { name, email, password, description } = req.body;
      const imageFile = req.file;

      // Validar campos obrigatórios
      if (!name || !email || !password) {
        return res.status(400).json({ 
          message: 'Nome, email e senha são obrigatórios' 
        });
      }

      console.log('Dados recebidos:', { 
        name, 
        email, 
        description, 
        hasImage: !!imageFile,
        hasPassword: !!password 
      });

      const user = await this.userService.createUser({
        name,
        email,
        password,
        description,
        imageFile,
      });

      console.log('Usuário criado com sucesso:', { id: user.id, email: user.email });

      // Remover a senha do objeto de resposta
      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        description: user.description,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      return res.status(201).json(userResponse);
    } catch (error) {
      console.error('Erro detalhado ao criar usuário:', error);
      
      // Tratar erro específico de usuário já cadastrado
      if (error instanceof Error && error.message === 'Usuário já está cadastrado') {
        return res.status(400).json({ 
          message: error.message 
        });
      }

      // Outros erros
      return res.status(500).json({ 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * @swagger
   * /users/authenticate:
   *   post:
   *     summary: Autenticar usuário
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Autenticação bem-sucedida
   *       401:
   *         description: Credenciais inválidas
   *       500:
   *         description: Erro interno do servidor
   */
  async authenticate(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          message: 'Email e senha são obrigatórios' 
        });
      }

      const result = await this.userService.authenticateUser(email, password);
      return res.json(result);
    } catch (error) {
      console.error('Erro na autenticação:', error);

      if (error instanceof Error) {
        switch (error.message) {
          case 'Email não encontrado':
          case 'Senha incorreta':
            return res.status(401).json({ message: error.message });
          case 'Email e senha são obrigatórios':
            return res.status(400).json({ message: error.message });
          default:
            return res.status(500).json({ 
              message: 'Internal server error',
              error: error.message 
            });
        }
      }

      return res.status(500).json({ 
        message: 'Internal server error',
        error: 'Unknown error'
      });
    }
  }

  /**
   * @swagger
   * /users:
   *   get:
   *     summary: Listar todos os usuários
   *     tags: [Users]
   *     responses:
   *       200:
   *         description: Lista de usuários
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/User'
   *       500:
   *         description: Erro interno do servidor
   */
  async list(req: Request, res: Response): Promise<Response> {
    try {
      const users = await this.userService.listUsers();
      return res.json(users);
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      return res.status(500).json({ 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * @swagger
   * /users/{id}:
   *   put:
   *     summary: Atualizar um usuário
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               description:
   *                 type: string
   *               image:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: Usuário atualizado com sucesso
   *       404:
   *         description: Usuário não encontrado
   *       500:
   *         description: Erro interno do servidor
   */
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { name, email, description } = req.body;
      const imageFile = req.file;

      const user = await this.userService.updateUser(id, {
        name,
        email,
        description,
        imageFile,
      });

      return res.json(user);
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        return res.status(404).json({ message: error.message });
      }
      if (error instanceof Error && error.message === 'Email already in use') {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * @swagger
   * /users/{id}:
   *   delete:
   *     summary: Excluir um usuário
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         description: Usuário excluído com sucesso
   *       404:
   *         description: Usuário não encontrado
   *       500:
   *         description: Erro interno do servidor
   */
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      await this.userService.deleteUser(id);
      return res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
} 