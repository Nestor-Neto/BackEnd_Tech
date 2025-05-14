import { Request, Response } from 'express';
import { CryptocurrencyRepository } from '../../infrastructure/repositories/CryptocurrencyRepository';
import axios from 'axios';

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
 */

export class CryptocurrencyController {
  private cryptocurrencyRepository: CryptocurrencyRepository;

  constructor() {
    this.cryptocurrencyRepository = new CryptocurrencyRepository();
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
   */
  async list(req: Request, res: Response): Promise<Response> {
    try {
      const cryptocurrencies = await this.cryptocurrencyRepository.list();
      return res.json(cryptocurrencies);
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * @swagger
   * /cryptocurrencies/update-prices:
   *   post:
   *     summary: Atualizar preços das criptomoedas
   *     tags: [Cryptocurrencies]
   *     responses:
   *       200:
   *         description: Preços atualizados com sucesso
   *       500:
   *         description: Erro interno do servidor
   */
  async updatePrices(req: Request, res: Response): Promise<Response> {
    try {
      await this.cryptocurrencyRepository.updatePrices();
      return res.json({ message: 'Prices updated successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * @swagger
   * /cryptocurrencies/{symbol}:
   *   get:
   *     summary: Obter preço de uma criptomoeda específica
   *     tags: [Cryptocurrencies]
   *     parameters:
   *       - in: path
   *         name: symbol
   *         required: true
   *         schema:
   *           type: string
   *         description: Símbolo da criptomoeda (ex: BTC, ETH)
   *     responses:
   *       200:
   *         description: Dados da criptomoeda
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Cryptocurrency'
   *       404:
   *         description: Criptomoeda não encontrada
   *       500:
   *         description: Erro interno do servidor
   */
  async getPrice(req: Request, res: Response): Promise<Response> {
    try {
      const { symbol } = req.params;
      const cryptocurrency = await this.cryptocurrencyRepository.findBySymbol(symbol);
      
      if (!cryptocurrency) {
        return res.status(404).json({ message: 'Cryptocurrency not found' });
      }

      return res.json(cryptocurrency);
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
} 