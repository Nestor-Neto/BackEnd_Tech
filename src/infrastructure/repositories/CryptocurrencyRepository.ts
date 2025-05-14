import { Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { Cryptocurrency } from '../../domain/entities/Cryptocurrency';
import { ICryptocurrencyRepository } from '../../domain/interfaces/irepositories/ICryptocurrencyRepository';
import axios from 'axios';

export class CryptocurrencyRepository implements ICryptocurrencyRepository {
  private repository: Repository<Cryptocurrency>;

  constructor() {
    this.repository = AppDataSource.getRepository(Cryptocurrency);
  }

  async create(cryptocurrency: Cryptocurrency): Promise<Cryptocurrency> {
    return this.repository.save(cryptocurrency);
  }

  async findById(id: string): Promise<Cryptocurrency | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findBySymbol(symbol: string): Promise<Cryptocurrency | null> {
    return this.repository.findOne({ where: { symbol } });
  }

  async update(id: string, cryptocurrencyData: Partial<Cryptocurrency>): Promise<Cryptocurrency> {
    await this.repository.update(id, cryptocurrencyData);
    const updatedCryptocurrency = await this.findById(id);
    if (!updatedCryptocurrency) {
      throw new Error('Cryptocurrency not found');
    }
    return updatedCryptocurrency;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async list(): Promise<Cryptocurrency[]> {
    return this.repository.find();
  }

  async updatePrices(): Promise<void> {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 100,
          page: 1,
          sparkline: false
        }
      });

      const cryptocurrencies = response.data;

      for (const crypto of cryptocurrencies) {
        const existingCrypto = await this.findBySymbol(crypto.symbol.toUpperCase());
        
        if (existingCrypto) {
          await this.update(existingCrypto.id, {
            currentPrice: crypto.current_price,
            marketCap: crypto.market_cap,
            volume24h: crypto.total_volume,
            priceChange24h: crypto.price_change_percentage_24h
          });
        } else {
          await this.create({
            name: crypto.name,
            symbol: crypto.symbol.toUpperCase(),
            currentPrice: crypto.current_price,
            marketCap: crypto.market_cap,
            volume24h: crypto.total_volume,
            priceChange24h: crypto.price_change_percentage_24h
          } as Cryptocurrency);
        }
      }
    } catch (error) {
      console.error('Error updating cryptocurrency prices:', error);
      throw new Error('Failed to update cryptocurrency prices');
    }
  }
} 