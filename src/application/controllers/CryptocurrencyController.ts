import { Request, Response } from 'express';
import { CryptocurrencyRepository } from '../../infrastructure/repositories/CryptocurrencyRepository';
import { CryptoCurrencyApiClient } from '../../infrastructure/clients/CryptoCurrencyApiClient';

/**
 * @swagger
 * components:
 *   schemas:
 *     Cryptocurrency:
 *       type: object
 *       required:
 *         - name
 *         - symbol
 *         - currentPrice
 *       properties:
 *         id:
 *           type: string
 *           description: ID único da criptomoeda
 *         name:
 *           type: string
 *           description: Nome da criptomoeda
 *         symbol:
 *           type: string
 *           description: Símbolo da criptomoeda
 *         currentPrice:
 *           type: number
 *           description: Preço atual
 *         marketCap:
 *           type: number
 *           description: Capitalização de mercado
 *         volume24h:
 *           type: number
 *           description: Volume em 24h
 *         priceChange24h:
 *           type: number
 *           description: Variação de preço em 24h
 *         lastUpdated:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 */

export class CryptocurrencyController {
  private cryptocurrencyRepository: CryptocurrencyRepository;
  private apiClient: CryptoCurrencyApiClient;

  constructor() {
    this.apiClient = new CryptoCurrencyApiClient();
    this.cryptocurrencyRepository = new CryptocurrencyRepository(this.apiClient);
  }

  /**
   * @swagger
   * /cryptocurrencies:
   *   get:
   *     summary: Listar todas as criptomoedas
   *     tags: [Cryptocurrencies]
   *     responses:
   *       200:
   *         description: Lista de criptomoedas
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Cryptocurrency'
   *       500:
   *         description: Erro interno do servidor
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   */
  async list(req: Request, res: Response): Promise<Response> {
    try {
      const cryptocurrencies = await this.cryptocurrencyRepository.list();
      return res.json(cryptocurrencies);
    } catch (error) {
      console.error('Erro ao listar criptomoedas:', error);
      return res.status(500).json({ 
        message: 'Erro ao listar criptomoedas',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * @swagger
   * /cryptocurrencies/name/{name}:
   *   get:
   *     summary: Buscar criptomoeda por nome
   *     tags: [Cryptocurrencies]
   *     parameters:
   *       - in: path
   *         name: name
   *         required: true
   *         schema:
   *           type: string
   *         description: Nome da criptomoeda
   *     responses:
   *       200:
   *         description: Dados da criptomoeda
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Cryptocurrency'
   *       404:
   *         description: Criptomoeda não encontrada
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       500:
   *         description: Erro interno do servidor
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   */
  async findByName(req: Request, res: Response): Promise<Response> {
    try {
      const { name } = req.params;
      const cryptocurrency = await this.cryptocurrencyRepository.findByName(name);
      
      if (!cryptocurrency) {
        return res.status(404).json({ message: 'Criptomoeda não encontrada' });
      }

      return res.json(cryptocurrency);
    } catch (error) {
      console.error(`Erro ao buscar criptomoeda por nome ${req.params.name}:`, error);
      return res.status(500).json({ 
        message: 'Erro ao buscar criptomoeda',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * @swagger
   * /cryptocurrencies/{id}:
   *   get:
   *     summary: Buscar criptomoeda por ID
   *     tags: [Cryptocurrencies]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID da criptomoeda
   *     responses:
   *       200:
   *         description: Dados da criptomoeda
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Cryptocurrency'
   *       404:
   *         description: Criptomoeda não encontrada
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       500:
   *         description: Erro interno do servidor
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   */
  async findById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const cryptocurrency = await this.cryptocurrencyRepository.findById(id);
      
      if (!cryptocurrency) {
        return res.status(404).json({ message: 'Criptomoeda não encontrada' });
      }

      return res.json(cryptocurrency);
    } catch (error) {
      console.error(`Erro ao buscar criptomoeda por ID ${req.params.id}:`, error);
      return res.status(500).json({ 
        message: 'Erro ao buscar criptomoeda',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
} 