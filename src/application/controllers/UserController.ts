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
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação do usuário
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data de atualização do usuário
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Mensagem de erro
 *         error:
 *           type: string
 *           description: Detalhes do erro
 *     Success:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Mensagem de sucesso
 */

export class UserController {
  private userService: UserService;

  constructor() {
    const userRepository = new UserRepository();
    this.userService = new UserService(userRepository);
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
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - email
   *               - password
   *             properties:
   *               name:
   *                 type: string
   *                 description: Nome do usuário (não pode ser vazio)
   *               email:
   *                 type: string
   *                 description: Email do usuário (deve ser único)
   *               password:
   *                 type: string
   *                 description: Senha do usuário
   *               description:
   *                 type: string
   *                 description: Descrição do usuário
   *               imageBase64:
   *                 type: string
   *                 description: Imagem em formato base64
   *     responses:
   *       201:
   *         description: Usuário criado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Dados inválidos ou usuário já existe
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Erro interno do servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { name, email, password, description, imageBase64 } = req.body;

      // Validar campos obrigatórios
      if (!name || name.trim() === '') {
        return res.status(400).json({ 
          message: 'Nome é obrigatório e não pode ser vazio' 
        });
      }

      if (!email || email.trim() === '') {
        return res.status(400).json({ 
          message: 'Email é obrigatório e não pode ser vazio' 
        });
      }

      if (!password) {
        return res.status(400).json({ 
          message: 'Senha é obrigatória' 
        });
      }

      console.log('Dados recebidos:', { 
        name, 
        email, 
        description, 
        hasImage: !!imageBase64,
        hasPassword: !!password 
      });

      const user = await this.userService.createUser({
        name,
        email,
        password,
        description,
        imageBase64,
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
          message: 'Este email já está cadastrado no sistema' 
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
   * /users/{id}:
   *   put:
   *     summary: Atualizar um usuário
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - id
   *             properties:
   *               id:
   *                 type: string
   *                 description: ID do usuário
   *               name:
   *                 type: string
   *                 description: Nome do usuário
   *               description:
   *                 type: string
   *                 description: Descrição do usuário
   *               imageBase64:
   *                 type: string
   *                 description: Imagem em formato base64
   *     responses:
   *       200:
   *         description: Usuário atualizado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Dados inválidos ou nome já em uso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Usuário não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Erro interno do servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id, name, description, imageBase64 } = req.body;
      
      console.log('Dados recebidos para atualização:', { id, name, description, hasImage: !!imageBase64 });
      
      if (!id) {
        return res.status(400).json({ message: 'ID do usuário é obrigatório' });
      }

      const user = await this.userService.updateUser(id, {
        name,
        description,
        imageBase64,
      });

      console.log('Usuário atualizado com sucesso:', { id: user.id, name: user.name });
      
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

      return res.json(userResponse);
    } catch (error) {
      if (error instanceof Error && error.message === 'usuário não encontrado!') {
        return res.status(404).json({ message: error.message });
      }
      if (error instanceof Error && error.message === 'Nome já está em uso') {
        return res.status(400).json({ message: error.message });
      }

      console.error('Erro ao atualizar usuário:', error);
      return res.status(500).json({ message: 'Internal server error' });
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
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *                   description: Token de autenticação
   *                 user:
   *                   $ref: '#/components/schemas/User'
   *       400:
   *         description: Dados inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Credenciais inválidas
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Erro interno do servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
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
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
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
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Erro interno do servidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      await this.userService.deleteUser(id);
      return res.status(204).send("Usuário excluído com sucesso");
    } catch (error) {
      if (error instanceof Error && error.message === 'usuário não encontrado!') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
} 